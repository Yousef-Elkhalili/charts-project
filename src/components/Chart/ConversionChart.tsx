import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ChartPoint, Variation, LineStyle } from '../../types';
import cup from '../../assets/cup.svg';
import calendar from '../../assets/calendar.svg';
import styles from './Chart.module.css';

type ConversionChartProps = {
  data: ChartPoint[];
  variations: Variation[];
  selectedVariationKeys: string[];
  lineStyle: LineStyle;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(2)}%`;
};

const CustomTooltip: React.FC<{
  active?: boolean;
  label?: string;
  payload?: any[];
  variations: Variation[];
}> = ({ active, payload, label, variations }) => {
  if (!active || !payload || payload.length === 0) return null;

  const byDataKey = new Map<string, any>();
  for (const item of payload) {
    const key = item.dataKey as string | undefined;
    if (!key) continue;
    byDataKey.set(key, item);
  }
  const uniqueItems = Array.from(byDataKey.values());

  const sorted = uniqueItems.sort(
    (a, b) => (b.value as number) - (a.value as number)
  );

  const maxValue = sorted.reduce((max, item) => {
    const v = item.value as number;
    if (typeof v === 'number' && !Number.isNaN(v) && v > max) return v;
    return max;
  }, Number.NEGATIVE_INFINITY);

  const byKey = new Map(variations.map((v) => [v.key, v]));


  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipHeaderIcon}>
          <img src={calendar} alt="" />
        </span>
        <span className={styles.tooltipHeaderLabel}>{label}</span>
      </div>
      <div className={styles.tooltipDivider} />

      {sorted.map((item, index) => {
        const v = byKey.get(item.dataKey as string);
        const color = item.color ?? v?.color ?? '#424242';
        const value = item.value as number | undefined;
        const isWinner =
          typeof value === 'number' &&
          !Number.isNaN(value) &&
          value === maxValue;

        return (
          <div key={item.dataKey ?? index} className={styles.tooltipRow}>
            <div className={styles.tooltipLeft}>
              <span
                className={styles.tooltipColorDot}
                style={{ backgroundColor: color }}
              />
              <span className={styles.tooltipName}>{item.name}</span>
              {isWinner && (
                <span
                  className={styles.tooltipTrophy}
                  title="Best variation"
                >
                  <img src={cup} alt="" />
                </span>
              )}
            </div>
            <div className={styles.tooltipValue}>
              {formatPercent(value ?? null)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const formatXAxisLabel = (value: string | number): string => {
  if (typeof value !== 'string') return String(value);

  const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!isIsoDate) return value; 

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');

  return `${month} ${day}`;
};

export const ConversionChart: React.FC<ConversionChartProps> = ({
  data,
  variations,
  selectedVariationKeys,
  lineStyle,
}) => {
  const { minY, maxY } = useMemo(() => {
    const values: number[] = [];
    for (const point of data) {
      for (const key of selectedVariationKeys) {
        const v = point[key];
        if (typeof v === 'number' && !Number.isNaN(v)) {
          values.push(v);
        }
      }
    }
    if (values.length === 0) {
      return { minY: 0, maxY: 1 };
    }
    let min = Math.min(...values);
    let max = Math.max(...values);

    const padding = (max - min || 1) * 0.1;
    min = Math.max(0, min - padding);
    max = max + padding;

    return { minY: min, maxY: max };
  }, [data, selectedVariationKeys]);

  if (data.length === 0) {
    return (
      <div className={styles.chartWrapper}>
        <div className={styles.emptyState}>No data</div>
      </div>
    );
  }

  const getLineType = () => {
    if (lineStyle === 'linear') return 'linear';
    return 'monotone';
  };

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="4 6"
            stroke="var(--grid-line)"
            vertical
            horizontal={false}
          />
          <XAxis
            dataKey="label"
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 11, fill: 'var(--axis-text)' }}
            tickMargin={8}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--axis-text)' }}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            domain={[minY, maxY]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip variations={variations} />}
            cursor={{ stroke: 'var(--grid-line)', strokeWidth: 1 }}
          />

          {variations
            .filter((v) => selectedVariationKeys.includes(v.key))
            .map((v) => (
              <React.Fragment key={v.key}>
                {lineStyle === 'area' && (
                  <Area
                    type="monotone"
                    dataKey={v.key}
                    fill={v.color}
                    fillOpacity={0.16}
                    stroke="none"
                    connectNulls
                  />
                )}

                {lineStyle === 'shadow' && (
                  <Line
                    type="monotone"
                    dataKey={v.key}
                    stroke={v.color}
                    strokeWidth={8}
                    strokeOpacity={0.25}
                    dot={false}
                    activeDot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}

                <Line
                  type={getLineType()}
                  dataKey={v.key}
                  name={v.name}
                  stroke={v.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </React.Fragment>
            ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
