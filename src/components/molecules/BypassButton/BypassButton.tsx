import styles from './BypassButton.module.less';

type BypassButtonProps = {
  bypassed: boolean;
  onToggle: () => void;
};

const BypassButton = ({ bypassed, onToggle }: BypassButtonProps) => {
  return (
    <button
      type="button"
      className={`${styles.button} ${bypassed ? styles.buttonBypassed : styles.buttonActive}`}
      onClick={onToggle}
      aria-pressed={bypassed}
      aria-label={bypassed ? 'Preset bypassed. Click to enable.' : 'Preset active. Click to bypass.'}
    >
      <span className={styles.dot} aria-hidden />
      <span className={styles.label}>{bypassed ? 'Bypassed' : 'Active'}</span>
      <span className={styles.hint}>(b)</span>
    </button>
  );
};

export default BypassButton;
