import { invoke } from '@tauri-apps/api/core';

type MidiStatus = 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'error';

type MidiServiceEvents = {
  status: (status: MidiStatus) => void;
  error: (message: string) => void;
  metrics: (metrics: ConnectionMetrics) => void;
  backoff: (delayMs: number, attempt: number) => void;
};

export type ConnectionMetrics = {
  latencyMs: number | null;
  dropped: number;
  lastSuccessTs: number | null;
};

type MidiTransport = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTest: () => Promise<number>; // returns latency in ms
  isConnected: () => boolean;
};

const isTauriRuntime =
  typeof window !== 'undefined' &&
  Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ??
      (window as unknown as { __TAURI_IPC__?: unknown }).__TAURI_IPC__
  );

class WebMidiTransport implements MidiTransport {
  private access: any = null;
  private output: any = null;

  async connect() {
    if (!('requestMIDIAccess' in navigator)) {
      throw new Error('Web MIDI not available in this environment');
    }
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    const outputs = Array.from(this.access.outputs.values());
    this.output = outputs[0] ?? null;
    if (!this.output) {
      throw new Error('No MIDI outputs found');
    }
  }

  async disconnect() {
    this.output = null;
    this.access = null;
  }

  isConnected() {
    return Boolean(this.output);
  }

  async sendTest() {
    if (!this.output) throw new Error('Not connected');
    const start = performance.now();
    // Send Active Sense (0xFE) if supported; otherwise a benign CC on channel 1.
    try {
      this.output.send([0xfe]);
    } catch {
      this.output.send([0xb0, 0x7f, 0x00]);
    }
    return performance.now() - start;
  }
}

class TauriMidiTransport implements MidiTransport {
  private connected = false;

  async connect() {
    await invoke('list_midi_outputs'); // smoke test
    this.connected = true;
  }

  async disconnect() {
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  async sendTest() {
    const start = performance.now();
    // Send a harmless CC0 message on channel 1; adjust command name as needed.
    await invoke('send_midi_cc', { channel: 1, control: 0, value: 0 });
    return performance.now() - start;
  }
}

type ListenerMap = {
  status: Set<(status: MidiStatus) => void>;
  error: Set<(message: string) => void>;
  metrics: Set<(metrics: ConnectionMetrics) => void>;
  backoff: Set<(delayMs: number, attempt: number) => void>;
};

export class MidiService {
  private listeners: ListenerMap = {
    status: new Set(),
    error: new Set(),
    metrics: new Set(),
    backoff: new Set()
  };
  private status: MidiStatus = 'disconnected';
  private metrics: ConnectionMetrics = { latencyMs: null, dropped: 0, lastSuccessTs: null };
  private transport: MidiTransport;
  private backoffAttempt = 0;
  private backoffTimer: ReturnType<typeof setTimeout> | null = null;
  private healthTimer: ReturnType<typeof setInterval> | null = null;
  private pingIntervalMs = 2500;

  constructor(transport?: MidiTransport) {
    this.transport = transport ?? (isTauriRuntime ? new TauriMidiTransport() : new WebMidiTransport());
  }

  on<U extends keyof MidiServiceEvents>(event: U, listener: MidiServiceEvents[U]) {
    this.listeners[event].add(listener as any);
    return () => this.off(event, listener);
  }

  off<U extends keyof MidiServiceEvents>(event: U, listener: MidiServiceEvents[U]) {
    this.listeners[event].delete(listener as any);
  }

  private emit<U extends keyof MidiServiceEvents>(event: U, ...args: Parameters<MidiServiceEvents[U]>) {
    this.listeners[event].forEach((listener) => {
      (listener as any)(...args);
    });
  }

  getState() {
    return {
      status: this.status,
      metrics: this.metrics
    };
  }

  async connect() {
    if (this.status === 'connecting' || this.status === 'connected') return;
    this.setStatus('connecting');
    try {
      await this.transport.connect();
      this.backoffAttempt = 0;
      this.setStatus('connected');
      this.startHealthChecks();
    } catch (error) {
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  async disconnect() {
    this.stopHealthChecks();
    this.clearBackoff();
    await this.transport.disconnect();
    this.setStatus('disconnected');
  }

  private setStatus(next: MidiStatus) {
    this.status = next;
    this.emit('status', next);
  }

  private updateMetrics(partial: Partial<ConnectionMetrics>) {
    this.metrics = { ...this.metrics, ...partial };
    this.emit('metrics', this.metrics);
  }

  private handleError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    this.setStatus('error');
    this.emit('error', message);
  }

  private startHealthChecks() {
    this.stopHealthChecks();
    this.healthTimer = setInterval(() => {
      this.sendPing();
    }, this.pingIntervalMs);
  }

  private stopHealthChecks() {
    if (this.healthTimer) clearInterval(this.healthTimer);
    this.healthTimer = null;
  }

  private clearBackoff() {
    if (this.backoffTimer) clearTimeout(this.backoffTimer);
    this.backoffTimer = null;
  }

  private scheduleReconnect() {
    this.clearBackoff();
    const delay = Math.min(1000 * 2 ** this.backoffAttempt, 15000);
    this.emit('backoff', delay, this.backoffAttempt + 1);
    this.backoffTimer = setTimeout(() => {
      this.backoffAttempt += 1;
      this.connect();
    }, delay);
  }

  private async sendPing() {
    if (!this.transport.isConnected()) {
      this.setStatus('disconnected');
      this.scheduleReconnect();
      return;
    }
    try {
      const latency = await this.transport.sendTest();
      this.updateMetrics({
        latencyMs: Math.round(latency),
        lastSuccessTs: Date.now()
      });
      const degraded = latency > 200;
      this.setStatus(degraded ? 'degraded' : 'connected');
    } catch (error) {
      this.updateMetrics({ dropped: this.metrics.dropped + 1 });
      this.handleError(error);
      this.scheduleReconnect();
    }
  }
}

// Singleton for convenience
export const midiService = new MidiService();
