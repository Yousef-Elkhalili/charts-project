import { useMemo } from 'react';
import type { Granularity } from '../types';
import { buildChartData } from '../utils/chartData';

export const useChartData = (granularity: Granularity) => {
  return useMemo(() => buildChartData(granularity), [granularity]);
};
