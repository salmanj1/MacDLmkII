import type { Mode } from '../data/commonParams';
import { modes } from '../data/commonParams';

type ModeSwitchProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

const ModeSwitch = ({ value, onChange }: ModeSwitchProps) => {
  return (
    <div className="flex gap-3 items-center" role="radiogroup" aria-label="Mode selector">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            value === mode
              ? 'bg-glow text-slate-900 border-glow shadow-lg shadow-cyan-500/40'
              : 'border-slate-500 text-slate-200 hover:border-glow'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};

export default ModeSwitch;
