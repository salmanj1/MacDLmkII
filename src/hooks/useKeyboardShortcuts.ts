import { useEffect } from 'react';
type KeyboardShortcutConfig = {
  onModeChange: (mode: 'MkII Delay' | 'Legacy Delay') => void;
  onDelayStep: (delta: number) => void;
  onReverbStep: (delta: number) => void;
  onHelpToggle?: () => void;
};

const useKeyboardShortcuts = ({
  onModeChange,
  onDelayStep,
  onReverbStep,
  onHelpToggle
}: KeyboardShortcutConfig) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        target?.isContentEditable ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === '1') {
        onModeChange('MkII Delay');
        return;
      }

      if (key === '2') {
        onModeChange('Legacy Delay');
        return;
      }

      if (key === 'q') {
        event.preventDefault();
        onDelayStep(-1);
        return;
      }

      if (key === 'e') {
        event.preventDefault();
        onDelayStep(1);
        return;
      }

      if (key === 'a') {
        event.preventDefault();
        onReverbStep(-1);
        return;
      }

      if (key === 'd') {
        event.preventDefault();
        onReverbStep(1);
        return;
      }

      if (key === '?' && onHelpToggle) {
        event.preventDefault();
        onHelpToggle();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDelayStep, onModeChange, onReverbStep, onHelpToggle]);
};

export default useKeyboardShortcuts;
