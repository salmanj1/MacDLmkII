import { useEffect } from 'react';
import styles from './KeyboardHelp.module.less';

type KeyboardHelpProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Modal overlay showing all keyboard shortcuts for quick reference.
 * Toggled with ? key or ESC to close.
 */
const KeyboardHelp = ({ isOpen, onClose }: KeyboardHelpProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="keyboard-help-title"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close help panel"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3>Mode Switching</h3>
            <dl className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <dt><kbd>1</kbd></dt>
                <dd>Switch to MkII Delay mode</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>2</kbd></dt>
                <dd>Switch to Legacy Delay mode</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section}>
            <h3>Navigation</h3>
            <dl className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <dt><kbd>Q</kbd></dt>
                <dd>Previous delay effect</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>E</kbd></dt>
                <dd>Next delay effect</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>A</kbd></dt>
                <dd>Previous reverb effect</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>D</kbd></dt>
                <dd>Next reverb effect</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>Arrow Keys</kbd></dt>
                <dd>Navigate selector knob (when focused)</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section}>
            <h3>Search & Help</h3>
            <dl className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <dt><kbd>Cmd/Ctrl</kbd> + <kbd>F</kbd></dt>
                <dd>Focus search box</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>?</kbd></dt>
                <dd>Show/hide this help panel</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>Esc</kbd></dt>
                <dd>Close help panel</dd>
              </div>
            </dl>
          </section>

          <section className={styles.section}>
            <h3>General</h3>
            <dl className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <dt><kbd>Tab</kbd></dt>
                <dd>Navigate between controls</dd>
              </div>
              <div className={styles.shortcut}>
                <dt><kbd>Enter</kbd> / <kbd>Space</kbd></dt>
                <dd>Activate focused button</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};

export default KeyboardHelp;
