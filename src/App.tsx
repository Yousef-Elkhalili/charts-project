// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import styles from './App.module.css';
import type { Granularity, LineStyle } from './types';
import { useChartData } from './hooks/useChartData';
import { Controls } from './components/Controls/Controls';
import { ConversionChart } from './components/Chart/ConversionChart';


type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const App: React.FC = () => {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [lineStyle, setLineStyle] = useState<LineStyle>('curve'); // по дефолту гладкие
  const { variations, points } = useChartData(granularity);

  // theme
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // We select by variation.key (slug)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    () => variations.map((v) => v.key) // all selected by default
  );

  useEffect(() => {
    if (selectedKeys.length === 0) {
      setSelectedKeys(variations.map((v) => v.key));
    }
  }, [variations, selectedKeys]);

  const handleToggleVariation = useCallback(
    (key: string) => {
      if (selectedKeys.includes(key)) {
        if (selectedKeys.length === 1) return;
        setSelectedKeys(selectedKeys.filter((k) => k !== key));
      } else {
        setSelectedKeys([...selectedKeys, key]);
      }
    },
    [selectedKeys]
  );

  const handleChangeGranularity = useCallback((g: Granularity) => {
    setGranularity(g);
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.card}>
        <Controls
          variations={variations}
          selectedVariationKeys={selectedKeys}
          onToggleVariation={handleToggleVariation}
          granularity={granularity}
          onChangeGranularity={handleChangeGranularity}
          theme={theme}
          onToggleTheme={toggleTheme}
          lineStyle={lineStyle}
          onChangeLineStyle={setLineStyle}
        />

        <section className={styles.chartSection}>
          <ConversionChart
            data={points}
            variations={variations}
            selectedVariationKeys={selectedKeys}
            lineStyle={lineStyle}
          />
        </section>
      </div>
    </div>
  );
};

export default App;
