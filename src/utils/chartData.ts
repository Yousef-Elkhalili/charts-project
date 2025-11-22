import abData from '../data/abData.json';
import type {
  RawData,
  Variation,
  Granularity,
  ChartPoint,
  RawDataPoint,
} from '../types';

const raw: RawData = abData as unknown as RawData;

const COLORS = ['#46464F', '#27ae60', '#FF8346', '#4142EF'];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const getVariations = (): Variation[] => {
  return raw.variations.map((v, index) => {
    const id =
      typeof v.id === 'number'
        ? String(v.id)
        : 
          index === 0
        ? '0'
        : String(index);

    return {
      id,
      name: v.name,
      key: slugify(v.name),
      color: COLORS[index % COLORS.length],
    };
  });
};

const getWeekKey = (d: Date): string => {
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const diffDays = Math.floor(
    (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const week = Math.floor(diffDays / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const getWeekLabel = (weekKey: string): string => {
  const [year, w] = weekKey.split('-W');
  return `Week ${parseInt(w, 10)} ${year}`;
};

const computeRate = (
  visits: number | undefined,
  conversions: number | undefined
): number | null => {
  if (visits == null || visits === 0 || conversions == null) return null;
  return (conversions / visits) * 100;
};

const buildDailyPoints = (variations: Variation[]): ChartPoint[] => {
  return raw.data.map((row) => {
    const dateObj = new Date(row.date);
    const point: ChartPoint = {
      timestamp: dateObj.getTime(),
      label: row.date,
    };

    for (const v of variations) {
      const visits = row.visits[v.id];
      const conversions = row.conversions[v.id];
      point[v.key] = computeRate(visits, conversions);
    }

    return point;
  });
};

const buildWeeklyPoints = (variations: Variation[]): ChartPoint[] => {
  type WeekAcc = {
    timestamp: number;
    label: string;
    visits: Record<string, number>;
    conversions: Record<string, number>;
  };

  const map = new Map<string, WeekAcc>();

  const addRow = (row: RawDataPoint) => {
    const dateObj = new Date(row.date);
    const weekKey = getWeekKey(dateObj);

    let acc = map.get(weekKey);
    if (!acc) {
      acc = {
        timestamp: dateObj.getTime(), 
        label: getWeekLabel(weekKey),
        visits: {},
        conversions: {},
      };
      map.set(weekKey, acc);
    }

    for (const v of variations) {
      const vId = v.id;
      const visits = row.visits[vId];
      const conversions = row.conversions[vId];

      if (visits != null) {
        acc.visits[vId] = (acc.visits[vId] ?? 0) + visits;
      }
      if (conversions != null) {
        acc.conversions[vId] = (acc.conversions[vId] ?? 0) + conversions;
      }
    }
  };

  for (const row of raw.data) {
    addRow(row);
  }

  const points: ChartPoint[] = [];

  for (const [, acc] of map.entries()) {
    const point: ChartPoint = {
      timestamp: acc.timestamp,
      label: acc.label,
    };

    for (const v of variations) {
      const visits = acc.visits[v.id];
      const conversions = acc.conversions[v.id];
      point[v.key] = computeRate(visits, conversions);
    }

    points.push(point);
  }

  points.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  return points;
};

export const buildChartData = (granularity: Granularity): {
  variations: Variation[];
  points: ChartPoint[];
} => {
  const variations = getVariations();
  const points =
    granularity === 'day'
      ? buildDailyPoints(variations)
      : buildWeeklyPoints(variations);

  return { variations, points };
};
