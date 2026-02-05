import { memo, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  height: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualListComponent<T>({ items, itemHeight, overscan = 3, height, renderItem }: VirtualListProps<T>) {
  const [startIndex, endIndex] = useMemo(() => {
    // Simple static window for now; can be extended to listen scrollTop
    const visibleCount = Math.ceil((typeof height === 'number' ? height : 600) / itemHeight) + overscan;
    return [0, Math.min(items.length, visibleCount)];
  }, [items.length, itemHeight, overscan, height]);

  const totalHeight = items.length * itemHeight;

  return (
    <div style={{ height, overflowY: 'auto', position: 'relative' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(startIndex, endIndex).map((item, index) => {
          const realIndex = startIndex + index;
          const top = realIndex * itemHeight;
          return (
            <div key={realIndex} style={{ position: 'absolute', top, left: 0, right: 0 }}>
              {renderItem(item, realIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent;

export default VirtualList;

