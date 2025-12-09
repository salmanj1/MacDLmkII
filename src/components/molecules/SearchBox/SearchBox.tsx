import { useEffect, useRef } from 'react';
import styles from './SearchBox.module.less';

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onFocusedShortcut: (ref: HTMLInputElement | null) => void;
};

/**
 * Library filter input with an explicit keyboard shortcut hint so users know how
 * to refocus it quickly. The ref is exposed to the keyboard shortcut hook.
 */
const SearchBox = ({ value, onChange, onFocusedShortcut }: SearchBoxProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onFocusedShortcut(inputRef.current);
  }, [onFocusedShortcut]);

  return (
    <label className={styles.searchLabel}>
      <div className={styles.labelRow}>
        <span>Search the library</span>
        <span className={styles.shortcutKeys} aria-label="Shortcut hint">
          <span className={styles.key}>⌘/Ctrl</span>
          <span className={styles.key}>F</span>
        </span>
      </div>
      <div className={styles.field}>
        <span className={styles.icon} aria-hidden>
          🔎
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Filter by model name, inspiration, or keywords..."
          className={styles.input}
          type="search"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>
    </label>
  );
};

export default SearchBox;
