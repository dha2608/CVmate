import { useEffect, useRef, useState } from 'react';
import * as React from 'react';

interface UseKeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Hook để handle keyboard navigation
 */
export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled) {return;}

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (onArrowUp) {
            e.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            e.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            e.preventDefault();
            onArrowRight();
          }
          break;
        case 'Enter':
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape]);
};

/**
 * Hook để tạo roving tabindex cho lists
 */
export const useRovingTabIndex = (itemCount: number, initialIndex = 0) => {
  const [focusedIndex, setFocusedIndex] = React.useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (index + 1) % itemCount;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (index - 1 + itemCount) % itemCount;
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastIndex = itemCount - 1;
        setFocusedIndex(lastIndex);
        itemRefs.current[lastIndex]?.focus();
        break;
    }
  };

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    tabIndex: focusedIndex === index ? 0 : -1,
    onKeyDown: handleKeyDown(index),
    onFocus: () => setFocusedIndex(index),
  });

  return { getItemProps, focusedIndex, setFocusedIndex };
};
