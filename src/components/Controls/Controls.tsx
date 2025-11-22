// src/components/Controls/Controls.tsx
import React, { useState } from 'react';
import type { Variation, Granularity, LineStyle } from '../../types';
import styles from './Controls.module.css';
import downArrow from '../../assets/downArrow.svg';

type Theme = 'light' | 'dark';

type ControlsProps = {
  variations: Variation[];
  selectedVariationKeys: string[];
  onToggleVariation: (key: string) => void;
  granularity: Granularity;
  onChangeGranularity: (g: Granularity) => void;
  theme: Theme;
  onToggleTheme: () => void;

  lineStyle: LineStyle;
  onChangeLineStyle: (style: LineStyle) => void;
};

export const Controls: React.FC<ControlsProps> = ({
  variations,
  selectedVariationKeys,
  onToggleVariation,
  granularity,
  onChangeGranularity,
  theme,
  onToggleTheme,
  lineStyle,
  onChangeLineStyle,
}) => {
  const [isVarMenuOpen, setIsVarMenuOpen] = useState(false);
  const [isGranMenuOpen, setIsGranMenuOpen] = useState(false);
  const [isLineMenuOpen, setIsLineMenuOpen] = useState(false);

  const lineStyleLabelMap: Record<LineStyle, string> = {
    linear: 'Straight linear',
    curve: 'Curve cardinal',
    area: 'Area',
    shadow: 'Shadow',
  };

  const allSelected = selectedVariationKeys.length === variations.length;
  const variationsLabel = allSelected
    ? 'All variations selected'
    : `${selectedVariationKeys.length} variations selected`;

  const handleToggleVar = (key: string) => {
    const isSelected = selectedVariationKeys.includes(key);
    if (isSelected && selectedVariationKeys.length === 1) return;
    onToggleVariation(key);
  };

  const handleSelectGranularity = (g: Granularity) => {
    onChangeGranularity(g);
    setIsGranMenuOpen(false);
  };

  const handleSelectLineStyle = (style: LineStyle) => {
    onChangeLineStyle(style);
    setIsLineMenuOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={styles.controlsRow}>
      <div className={styles.leftGroup}>
        <div className={styles.selectWrapper}>
          <button
            type="button"
            className={`${styles.selectButton} ${styles.selectButtonWide}`}
            onClick={() => setIsVarMenuOpen((open) => !open)}
          >
            <span>{variationsLabel}</span>
            <span className={styles.selectArrow}>
              <img src={downArrow} alt="" />
            </span>
          </button>

          {isVarMenuOpen && (
            <div className={styles.menu}>
              {variations.map((v) => {
                const checked = selectedVariationKeys.includes(v.key);
                const disabled = checked && selectedVariationKeys.length === 1;

                return (
                  <button
                    key={v.key}
                    type="button"
                    className={styles.menuItem}
                    onClick={() => !disabled && handleToggleVar(v.key)}
                  >
                    <span
                      className={`${styles.checkbox} ${
                        checked ? styles.checkboxChecked : ''
                      }`}
                    />
                    <span>{v.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.selectWrapper}>
          <button
            type="button"
            className={`${styles.selectButton} ${styles.selectButtonNarrow}`}
            onClick={() => setIsGranMenuOpen((open) => !open)}
          >
            <span>{granularity === 'day' ? 'Day' : 'Week'}</span>
            <span className={styles.selectArrow}>
              <img src={downArrow} alt="" />
            </span>
          </button>

          {isGranMenuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectGranularity('day')}
              >
                Day
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectGranularity('week')}
              >
                Week
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.selectWrapper}>
          <button
            type="button"
            className={`${styles.selectButton} ${styles.selectButtonWide}`}
            onClick={() => setIsLineMenuOpen((open) => !open)}
          >
            <span>{`Line style: ${lineStyleLabelMap[lineStyle]}`}</span>
            <span className={styles.selectArrow}>
              <img src={downArrow} alt="" />
            </span>
          </button>

          {isLineMenuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectLineStyle('linear')}
              >
                Straight linear
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectLineStyle('curve')}
              >
                Curve cardinal
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectLineStyle('area')}
              >
                Area
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => handleSelectLineStyle('shadow')}
              >
                Shadow
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};
