import type { Mode } from '../../../data/commonParams';
import styles from './ModeSwitch.module.less';

type ModeSwitchProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
  options?: Mode[];
};

/**
 * Radio-style control for swapping between modeling modes. Presented as a pill row
 * so the selector mirrors the hardware toggle while staying keyboard accessible.
 */
const ModeSwitch = ({ value, onChange, options }: ModeSwitchProps) => {
  const choices = options && options.length ? options : (['MkII Delay', 'Legacy Delay', 'Secret Reverb'] as Mode[]);
  return (
    <div
      className={styles.switchGroup}
      role="radiogroup"
      aria-label="Mode selector"
    >
      {choices.map((mode) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mode)}
            className={`${styles.modeButton} ${isActive ? styles.modeButtonActive : ''}`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
};

export default ModeSwitch;
