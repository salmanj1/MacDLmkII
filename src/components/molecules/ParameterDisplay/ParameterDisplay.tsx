import type { FC } from 'react';
import { getParameterSet } from '../../../data/parameterMappings';
import type { Mode } from '../../../data/commonParams';

type Props = {
  mode: Mode;
  modelName?: string | null;
  values: Record<string, number>;
  altActive?: boolean;
};

const formatValue = (val: number, unit: string, formatter?: (value: number) => string) => {
  if (formatter) return formatter(val);
  if (unit === '%') return `${Math.round((val / 127) * 100)}%`;
  if (unit === 'ms') return `${Math.round((val / 127) * 2500)} ms`;
  return `${val}`;
};

const ParameterDisplay: FC<Props> = ({ mode, modelName, values, altActive = false }) => {
  const params = getParameterSet(mode, modelName ?? undefined);

  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-700/70 bg-slate-900/80 p-3 text-slate-100 shadow-lg">
      {params.map((param) => {
        const raw = values[param.id] ?? 0;
        const label = altActive && param.secondaryLabel ? param.secondaryLabel : param.primaryLabel;
        return (
          <div key={param.id} className="flex flex-col gap-1 rounded-md bg-slate-800/60 px-3 py-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{label}</span>
              <span className="text-xs text-slate-300">{formatValue(raw, param.unit, param.formatter)}</span>
            </div>
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
  );
};

export default ParameterDisplay;
