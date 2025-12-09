import { useEffect } from 'react';
import { modes, type Mode } from '../data/commonParams';

type KeyboardShortcutConfig = {
  mode: Mode;
  currentDetent: number;
  onModeChange: (mode: Mode) => void;
  onDetentChange: (next: number) => void;
  searchInput?: HTMLInputElement | null;
};

const useKeyboardShortcuts = ({
  mode: _mode,
  currentDetent,
  onModeChange,
  onDetentChange,
  searchInput
}: KeyboardShortcutConfig) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInput?.focus();
        return;
      }

      if (['1', '2', '3'].includes(event.key)) {
        const nextMode = modes[Number(event.key) - 1];
        if (nextMode) onModeChange(nextMode);
        return;
      }

      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
      ) {
        event.preventDefault();
        const delta =
          event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1;
        onDetentChange(currentDetent + delta);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentDetent, onDetentChange, onModeChange, searchInput]);
};

export default useKeyboardShortcuts;
