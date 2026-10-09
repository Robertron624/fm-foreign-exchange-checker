import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Tracks the position of the active item so a single "pill" element can slide
 * between items. The container must be `position: relative`.
 */
export function useSlidingPill<K>(activeKey: K) {
  const items = useRef(new Map<K, HTMLElement>());
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = items.current.get(activeKey);
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeKey]);

  const registerItem = (key: K) => (el: HTMLElement | null) => {
    if (el) items.current.set(key, el);
  };

  return {
    registerItem,
    pillStyle: pill
      ? { transform: `translateX(${pill.left}px)`, width: pill.width }
      : undefined,
  };
}
