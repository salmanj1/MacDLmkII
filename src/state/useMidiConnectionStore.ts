import { useSyncExternalStore } from 'react';
import { midiService, type ConnectionMetrics, type MidiService } from '../services/midiService';

type ConnectionState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'degraded' | 'error';
  metrics: ConnectionMetrics;
  lastError: string | null;
  backoff: { delayMs: number; attempt: number } | null;
};

const createStore = (service: MidiService) => {
  let state: ConnectionState = {
    status: 'disconnected',
    metrics: { latencyMs: null, dropped: 0, lastSuccessTs: null },
    lastError: null,
    backoff: null
  };

  const subscribers = new Set<() => void>();

  const notify = () => {
    subscribers.forEach((fn) => fn());
  };

  service.on('status', (status) => {
    state = { ...state, status };
    notify();
  });

  service.on('metrics', (metrics) => {
    state = { ...state, metrics };
    notify();
  });

  service.on('error', (message) => {
    state = { ...state, status: 'error', lastError: message };
    notify();
  });

  service.on('backoff', (delayMs, attempt) => {
    state = { ...state, backoff: { delayMs, attempt } };
    notify();
  });

  const subscribe = (listener: () => void) => {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  };

  const getState = () => state;

  return { subscribe, getState, service };
};

const store = createStore(midiService);

export const useMidiConnectionStore = () =>
  useSyncExternalStore(store.subscribe, store.getState, store.getState);

export const midiConnectionService = store.service;
