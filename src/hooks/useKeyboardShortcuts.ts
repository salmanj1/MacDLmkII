import { useEffect } from 'react';
type KeyboardShortcutConfig = {
  onModeChange: (mode: 'MkII Delay' | 'Legacy Delay') => void;
  onDelayStep: (delta: number) => void;
  onReverbStep: (delta: number) => void;
};

const useKeyboardShortcuts = ({
  onModeChange,
  onDelayStep,
  onReverbStep
}: KeyboardShortcutConfig) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (event.key === '1') {
        onModeChange('MkII Delay');
        return;
      }

      if (event.key === '2') {
        onModeChange('Legacy Delay');
        return;
      }

      if (event.key.toLowerCase() === 'q') {
        event.preventDefault();
        onDelayStep(-1);
        return;
      }

      if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        onDelayStep(1);
        return;
      }

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onReverbStep(-1);
        return;
      }

      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        onReverbStep(1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDelayStep, onModeChange, onReverbStep]);
};

export default useKeyboardShortcuts;
