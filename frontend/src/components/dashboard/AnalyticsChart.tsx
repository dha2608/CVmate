import { useMemo } from 'react';
import { Activity, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsChartProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
  previousPeriod?: number;
  currentPeriod?: number;
}

const AnalyticsChart = ({
  title,
  data,
  color = 'bg-blue-500',
  previousPeriod,
  currentPeriod,
}: AnalyticsChartProps) => {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const trend = useMemo(() => {
    if (!previousPeriod || !currentPeriod) {
      return null;
    }
    const change = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  }, [previousPeriod, currentPeriod]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? <Activity size={14} /> : <TrendingDown size={14} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-600 dark:text-gray-400 truncate">
              {item.label}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`${color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-xs font-semibold text-gray-700 dark:text-gray-300 text-right">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
