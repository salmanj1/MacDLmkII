import type { FC } from 'react';
import { getParameterSet } from '../../../data/parameterMappings';
import type { Mode } from '../../../data/commonParams';

type Props = {
  mode: Mode;
  modelName?: string | null;
  values: Record<string, number>;
  reverbModelName?: string | null;
  reverbValues?: Record<string, number>;
  altActive?: boolean;
  onDelayChange?: (id: string, value: number) => void;
  onReverbChange?: (id: string, value: number) => void;
  delayDescription?: string | null;
  reverbDescription?: string | null;
};

const formatValue = (val: number, unit: string, formatter?: (value: number) => string) => {
  if (formatter) return formatter(val);
  if (unit === '%') return `${Math.round((val / 127) * 100)}%`;
  if (unit === 'ms') return `${Math.round((val / 127) * 2500)} ms`;
  return `${val}`;
};

const ParameterDisplay: FC<Props> = ({
  mode,
  modelName,
  values,
  reverbModelName,
  reverbValues,
  altActive = false,
  onDelayChange,
  onReverbChange,
  delayDescription,
  reverbDescription
}) => {
  const delayParams = getParameterSet(mode, modelName ?? undefined);
  const reverbParams = reverbModelName
    ? getParameterSet('Secret Reverb', reverbModelName ?? undefined)
    : [];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-700/70 bg-slate-900/80 p-3 text-slate-100 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Delay</div>
        {delayDescription && (
          <div className="text-sm text-slate-300 leading-snug">{delayDescription}</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {delayParams.map((param) => {
            const raw = values[param.id] ?? 0;
            const label = altActive && param.secondaryLabel ? param.secondaryLabel : param.primaryLabel;
            return (
              <div key={param.id} className="flex flex-col gap-1 rounded-md bg-slate-800/60 px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{label}</span>
                  <span className="text-xs text-slate-300">{formatValue(raw, param.unit, param.formatter)}</span>
                </div>
                {onDelayChange && (
                  <input
                    type="range"
                    min={0}
                    max={127}
                    value={raw}
                    onChange={(e) => onDelayChange(param.id, Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-emerald-400"
                  />
                )}
                <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${Math.min(100, Math.max(0, (raw / 127) * 100))}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">Value: {raw}/127</div>
              </div>
            );
          })}
        </div>
      </div>

      {reverbParams.length > 0 && reverbValues && (
        <div className="flex flex-col gap-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Reverb</div>
          {reverbDescription && (
            <div className="text-sm text-slate-300 leading-snug">{reverbDescription}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {reverbParams.map((param) => {
              const raw = reverbValues[param.id] ?? 0;
              const label = param.primaryLabel;
              return (
                <div key={param.id} className="flex flex-col gap-1 rounded-md bg-slate-800/60 px-3 py-2">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{label}</span>
                    <span className="text-xs text-slate-300">{formatValue(raw, param.unit, param.formatter)}</span>
                  </div>
                  {onReverbChange && (
                    <input
                      type="range"
                      min={0}
                      max={127}
                      value={raw}
                      onChange={(e) => onReverbChange(param.id, Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer accent-indigo-400"
                    />
                  )}
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{ width: `${Math.min(100, Math.max(0, (raw / 127) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">Value: {raw}/127</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterDisplay;
