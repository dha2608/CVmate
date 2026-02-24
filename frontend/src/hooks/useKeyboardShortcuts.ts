import { useEffect, useMemo } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

const getShortcutKey = (s: Shortcut) => {
  const mods = `${s.ctrl ? '1' : '0'}${s.shift ? '1' : '0'}${s.alt ? '1' : '0'}`;
  return `${mods}:${s.key.toLowerCase()}`;
};

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const actionsByKey = useMemo(() => {
    const map = new Map<string, () => void>();
    shortcuts.forEach((s) => {
      map.set(getShortcutKey(s), s.action);
    });
    return map;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlPressed = e.ctrlKey || e.metaKey;
      const mods = `${ctrlPressed ? '1' : '0'}${e.shiftKey ? '1' : '0'}${e.altKey ? '1' : '0'}`;
      const key = `${mods}:${e.key.toLowerCase()}`;

      const action = actionsByKey.get(key);
      if (!action) {return;}

      e.preventDefault();
      action();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionsByKey]);
};

export default useKeyboardShortcuts;
