import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  useMidiDebugger,
  toggleMidiLogFilter,
  clearMidiLog,
  type MidiLogEntry
} from '../../../state/useMidiDebugger';

const formatEntry = (entry: MidiLogEntry) => {
  if (entry.type === 'pc') return `Program Change #${entry.summary}`;
  if (entry.type === 'cc') return entry.summary;
  return entry.summary;
};

const badgeColor = (direction: MidiLogEntry['direction']) =>
  direction === 'out' ? 'text-blue-300' : direction === 'in' ? 'text-green-300' : 'text-rose-300';

const typeLabel = (type: MidiLogEntry['type']) =>
  type === 'pc'
    ? 'PC'
    : type === 'cc'
      ? 'CC'
      : type === 'sysex'
        ? 'SysEx'
        : type === 'clock'
          ? 'Clock'
          : 'Other';

type Props = {
  onClose?: () => void;
};

const MidiDebuggerPanel: FC<Props> = ({ onClose }) => {
  const { entries, filters } = useMidiDebugger();
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) => filters[e.type] && filters[e.direction]
      ),
    [entries, filters]
  );

  const copyEntry = async (entry: MidiLogEntry) => {
    const line = `${new Date(entry.ts).toISOString()} [${entry.direction}] ${typeLabel(entry.type)} ${entry.summary}${entry.detail ? ` — ${entry.detail}` : ''}`;
    await navigator.clipboard.writeText(line);
  };

  const exportLog = async () => {
    setExporting(true);
    try {
      const lines = filtered
        .map(
          (e) =>
            `${new Date(e.ts).toISOString()} [${e.direction}] ${typeLabel(e.type)} ${e.summary}${e.detail ? ` — ${e.detail}` : ''}`
        )
        .join('\n');
      const blob = new Blob([lines], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'midi-log.txt';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-[420px] max-h-[45vh] flex-col gap-2 rounded-lg border border-slate-700/70 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-slate-100">MIDI Debugger</div>
        <div className="flex gap-2 text-[11px] text-slate-300">
          {(['pc', 'cc', 'sysex', 'clock', 'other', 'out', 'in', 'error'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleMidiLogFilter(key)}
              className={`rounded border px-2 py-1 ${
                filters[key] ? 'border-slate-500 bg-slate-800 text-slate-100' : 'border-slate-700 bg-slate-900 text-slate-500'
              }`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 hover:border-slate-300"
            onClick={clearMidiLog}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 hover:border-slate-300 disabled:opacity-60"
            onClick={exportLog}
            disabled={exporting}
          >
            Export
          </button>
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 hover:border-slate-300"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/60">
        <div className="divide-y divide-slate-800">
          {filtered.length === 0 && (
            <div className="p-3 text-sm text-slate-400">No MIDI messages yet.</div>
          )}
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-3 py-2 text-sm text-slate-100"
            >
              <div className="flex flex-col items-start text-[11px] text-slate-400">
                <span>{new Date(entry.ts).toLocaleTimeString()}</span>
                <span className={badgeColor(entry.direction)}>{entry.direction}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                    {typeLabel(entry.type)}
                  </span>
                  <span>{formatEntry(entry)}</span>
                </div>
                {entry.detail && (
                  <div className="text-xs text-slate-300">{entry.detail}</div>
                )}
              </div>
              <button
                type="button"
                className="rounded border border-slate-600 px-2 py-1 text-[11px] text-slate-100 hover:border-slate-300"
                onClick={() => copyEntry(entry)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MidiDebuggerPanel;
