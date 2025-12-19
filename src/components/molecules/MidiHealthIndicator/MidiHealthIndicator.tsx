import type { FC } from 'react';
import { useMemo } from 'react';
import { useMidiConnectionStore, midiConnectionService } from '../../../state/useMidiConnectionStore';

type Props = {
  showMeta?: boolean;
  onReconnect?: () => void;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'bg-green-500';
    case 'degraded':
    case 'connecting':
      return 'bg-amber-400';
    case 'error':
    case 'disconnected':
    default:
      return 'bg-red-500';
  }
};

export const MidiHealthIndicator: FC<Props> = ({ showMeta = true, onReconnect }) => {
  const { status, metrics, lastError, backoff } = useMidiConnectionStore();

  const label = useMemo(() => {
    if (status === 'connected') return 'Connected';
    if (status === 'degraded') return 'Degraded';
    if (status === 'connecting') return 'Connecting…';
    if (status === 'error') return 'Error';
    return 'Disconnected';
  }, [status]);

  const latencyText =
    metrics.latencyMs !== null ? `${metrics.latencyMs} ms` : status === 'connected' ? '—' : 'n/a';

  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-600/50 bg-slate-900/70 px-3 py-2 text-slate-100 shadow-md">
      <span className={`h-2.5 w-2.5 rounded-full ${statusColor(status)}`} aria-hidden />
      <div className="flex flex-col">
        <span className="text-sm font-semibold leading-tight">{label}</span>
        {showMeta && (
          <span className="text-xs text-slate-300">
            Latency: {latencyText} · Dropped: {metrics.dropped}
          </span>
        )}
        {lastError && status === 'error' && (
          <span className="text-xs text-rose-200">{lastError}</span>
        )}
        {backoff && status !== 'connected' && (
          <span className="text-xs text-amber-200">
            Reconnecting in {Math.round(backoff.delayMs / 1000)}s (attempt {backoff.attempt})
          </span>
        )}
        {metrics.lastSuccessTs && showMeta && (
          <span className="text-[11px] text-slate-400">
            Last message: {new Date(metrics.lastSuccessTs).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-500/60 px-2 py-1 text-xs font-semibold text-slate-100 hover:border-slate-300"
          onClick={() => {
            midiConnectionService.connect();
            onReconnect?.();
          }}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default MidiHealthIndicator;
