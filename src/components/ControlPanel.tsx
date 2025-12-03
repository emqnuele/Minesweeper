import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { DIFFICULTIES, MAX_COLUMNS, MAX_ROWS, MIN_COLUMNS, MIN_MINES, MIN_ROWS } from '../constants';
import { GameConfig, GameStatus } from '../types';

interface ControlPanelProps {
  selectedDifficulty: typeof DIFFICULTIES[number];
  customConfig: GameConfig;
  onSelectDifficulty: (id: typeof DIFFICULTIES[number]['id']) => void;
  onCustomConfigChange: (config: GameConfig) => void;
  onStart: () => void;
  status: GameStatus;
  variant?: 'home' | 'game';
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const ControlPanel = ({
  selectedDifficulty,
  customConfig,
  onSelectDifficulty,
  onCustomConfigChange,
  onStart,
  status,
  variant = 'game'
}: ControlPanelProps) => {
  const isHome = variant === 'home';
  const currentConfig = selectedDifficulty.id === 'custom' ? customConfig : selectedDifficulty.config;
  const totalCells = currentConfig.rows * currentConfig.columns;
  const mineDensity = Math.round((currentConfig.mines / totalCells) * 100);
  const buttonLabel = isHome ? 'Inizia la partita' : status === 'playing' ? 'Ricominciamo' : 'Avvia partita';

  const containerClasses = isHome
    ? 'flex flex-col gap-6 rounded-3xl border border-surfaceSoft bg-surfaceHighlight p-6 shadow-soft'
    : 'flex flex-col gap-6 rounded-3xl border border-surfaceSoft bg-surfaceHighlight px-5 py-6 shadow-soft';

  const difficultyCards = useMemo(
    () =>
      DIFFICULTIES.map((difficulty) => {
        const isActive = difficulty.id === selectedDifficulty.id;
        return (
          <motion.button
            key={difficulty.id}
            type="button"
            onClick={() => onSelectDifficulty(difficulty.id)}
            className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left shadow-soft transition ${
              isActive
                ? 'border-accentMuted/45 bg-accentSoft ring-1 ring-accentMuted/40'
                : 'border-surfaceSoft bg-surfaceHighlight hover:border-accentSoft'
            }`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-textMuted/70">
                  {difficulty.name}
                </p>
                <p className="mt-1 text-sm text-textMuted">{difficulty.description}</p>
              </div>
              <motion.span
                className={`ml-3 inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-full text-sm font-semibold ${
                  isActive ? 'bg-accentMuted text-white shadow-glass' : 'bg-surfaceSoft text-textMuted'
                }`}
                layout
              >
                {difficulty.config.rows}x{difficulty.config.columns}
              </motion.span>
            </div>
          </motion.button>
        );
      }),
    [onSelectDifficulty, selectedDifficulty.id]
  );

  const handleNumericChange = (key: keyof GameConfig) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    const safeValue = Number.isNaN(value) ? 0 : value;
    const updated: GameConfig = {
      ...customConfig,
      [key]: safeValue
    };

    if (key === 'rows') {
      updated.rows = clamp(safeValue, MIN_ROWS, MAX_ROWS);
      updated.mines = clamp(updated.mines, MIN_MINES, updated.rows * updated.columns - 1);
    } else if (key === 'columns') {
      updated.columns = clamp(safeValue, MIN_COLUMNS, MAX_COLUMNS);
      updated.mines = clamp(updated.mines, MIN_MINES, updated.rows * updated.columns - 1);
    } else if (key === 'mines') {
      const maxMines = Math.max(1, updated.rows * updated.columns - 1);
      updated.mines = clamp(safeValue, MIN_MINES, maxMines);
    }

    onCustomConfigChange(updated);
  };

  const handleCheckboxChange = (key: 'safeStart' | 'allowChord' | 'allowQuestionMark') => () => {
    onCustomConfigChange({
      ...customConfig,
      [key]: !customConfig[key]
    });
  };

  const canStart = totalCells > 0 && currentConfig.mines < totalCells;

  return (
    <aside className={containerClasses}>
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-textMuted/70">Difficolta</p>
        <div className="mt-3 flex flex-col gap-3">{difficultyCards}</div>
      </div>

      <AnimatePresence initial={false}>
        {selectedDifficulty.id === 'custom' ? (
          <motion.div
            key="custom-settings"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 rounded-2xl border border-surfaceSoft bg-surfaceHighlight p-4 shadow-soft"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-textMuted/70">Impostazioni personalizzate</p>

            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-xs text-textMuted">
                Righe
                <input
                  type="number"
                  value={customConfig.rows}
                  onChange={handleNumericChange('rows')}
                  min={MIN_ROWS}
                  max={MAX_ROWS}
                  className="rounded-lg border border-surfaceSoft bg-white px-3 py-2 text-sm font-semibold text-textPrimary focus:border-accentMuted focus:outline-none focus:ring-1 focus:ring-accentMuted/40"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-textMuted">
                Colonne
                <input
                  type="number"
                  value={customConfig.columns}
                  onChange={handleNumericChange('columns')}
                  min={MIN_COLUMNS}
                  max={MAX_COLUMNS}
                  className="rounded-lg border border-surfaceSoft bg-white px-3 py-2 text-sm font-semibold text-textPrimary focus:border-accentMuted focus:outline-none focus:ring-1 focus:ring-accentMuted/40"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-textMuted">
                Mine
                <input
                  type="number"
                  value={customConfig.mines}
                  onChange={handleNumericChange('mines')}
                  min={MIN_MINES}
                  max={customConfig.rows * customConfig.columns - 1}
                  className="rounded-lg border border-surfaceSoft bg-white px-3 py-2 text-sm font-semibold text-textPrimary focus:border-accentMuted focus:outline-none focus:ring-1 focus:ring-accentMuted/40"
                />
              </label>
            </div>

            <div className="grid gap-2 text-sm text-textMuted">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-surfaceSoft bg-white px-3 py-2">
                <span>Prima mossa sicura</span>
                <input
                  type="checkbox"
                  checked={customConfig.safeStart}
                  onChange={handleCheckboxChange('safeStart')}
                  className="h-5 w-5 rounded border border-accentMuted/40 bg-white accent-accent"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-surfaceSoft bg-white px-3 py-2">
                <span>Doppio click per chording</span>
                <input
                  type="checkbox"
                  checked={customConfig.allowChord}
                  onChange={handleCheckboxChange('allowChord')}
                  className="h-5 w-5 rounded border border-accentMuted/40 bg-white accent-accent"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-surfaceSoft bg-white px-3 py-2">
                <span>Ciclo con punto interrogativo</span>
                <input
                  type="checkbox"
                  checked={customConfig.allowQuestionMark}
                  onChange={handleCheckboxChange('allowQuestionMark')}
                  className="h-5 w-5 rounded border border-accentMuted/40 bg-white accent-accent"
                />
              </label>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="rounded-2xl border border-surfaceSoft bg-surfaceHighlight p-4 shadow-soft">
        <p className="text-xs uppercase tracking-[0.32em] text-textMuted/70">Panoramica partita</p>
        <div className="mt-3 grid gap-2 text-sm text-textMuted">
          <div className="flex justify-between">
            <span>Griglia</span>
            <span className="font-semibold text-textPrimary">
              {currentConfig.rows} x {currentConfig.columns} ({totalCells} celle)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mine</span>
            <span className="font-semibold text-textPrimary">
              {currentConfig.mines} ({mineDensity}%)
            </span>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-accent to-accentMuted px-5 py-3 text-lg font-semibold text-white shadow-[0_26px_55px_-22px_rgba(67,207,110,0.55)] transition hover:from-accent/90 hover:to-accentMuted/90 disabled:cursor-not-allowed disabled:opacity-60"
        whileTap={{ scale: 0.98 }}
      >
        {buttonLabel}
        <motion.span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-sm font-semibold text-white"
          animate={{ rotate: status === 'playing' && !isHome ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          &gt;
        </motion.span>
      </motion.button>
    </aside>
  );
};
