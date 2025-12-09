import type { Mode } from '../data/commonParams';
import { modes } from '../data/commonParams';

type ModeSwitchProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

const ModeSwitch = ({ value, onChange }: ModeSwitchProps) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2 sm:gap-3"
      role="radiogroup"
      aria-label="Mode selector"
    >
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={`w-full rounded-full border px-4 py-2 text-center text-sm font-medium transition-colors sm:w-auto ${
            value === mode
              ? 'bg-glow text-slate-900 border-glow shadow-lg shadow-lime-400/40'
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
