export type RawVariation = {
  id?: number;
  name: string;
};

export type RawDataPoint = {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
};

export type RawData = {
  variations: RawVariation[];
  data: RawDataPoint[];
};

export type Variation = {
  id: string;       
  name: string;     
  key: string;    
  color: string;    
};

export type Granularity = 'day' | 'week';

export type ChartPoint = {
  timestamp: number; 
  label: string;    
  [variationKey: string]: string | number | null;
};

export type LineStyle = 'linear' | 'curve' | 'area' | 'shadow';
