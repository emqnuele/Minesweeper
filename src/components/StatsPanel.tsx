import { motion } from 'framer-motion';
import { Bomb, Brain, Clock, RefreshCcw, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { GameStats, GameStatus } from '../types';
import { formatTime, pluralize } from '../utils/format';

interface StatsPanelProps {
  stats: GameStats;
  statusLabel: string;
  onReset: () => void;
  onHint: () => void;
  disableHint: boolean;
  disableReset: boolean;
  isOpMode?: boolean;
  isCheatPeekActive?: boolean;
}

const statusBadgeClasses: Record<GameStatus, string> = {
  idle: 'bg-surfaceHighlight text-textMuted',
  ready: 'bg-surfaceHighlight text-textMuted',
  playing: 'bg-accentGlow text-accentMuted',
  won: 'bg-accentGlow text-accentMuted',
  lost: 'bg-[#ffe4e6] text-danger'
};

export const StatsPanel = ({
  stats,
  statusLabel,
  onReset,
  onHint,
  disableHint,
  disableReset,
  isOpMode = false,
  isCheatPeekActive = false
}: StatsPanelProps) => {
  return (
    <section className="rounded-3xl border border-surfaceSoft bg-surfaceHighlight px-6 py-5 shadow-soft">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-textMuted/70 md:text-xs">Stato</p>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold md:px-4 md:py-1.5 md:text-sm ${statusBadgeClasses[stats.status]}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
          <StatPill icon={<Clock className="h-3.5 w-3.5 text-accentMuted md:h-4 md:w-4" />} label={formatTime(stats.timeMs)} caption="Tempo" />
          <StatPill
            icon={<Bomb className="h-3.5 w-3.5 text-danger md:h-4 md:w-4" />}
            label={stats.flagsLeft.toString()}
            caption="Mine"
          />
          <StatPill
            icon={<Brain className="h-3.5 w-3.5 text-warning md:h-4 md:w-4" />}
            label={stats.mistakes.toString()}
            caption="Errori"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isOpMode ? (
            <motion.span
              key={isCheatPeekActive ? 'op-active' : 'op-idle'}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${isCheatPeekActive ? 'bg-accentMuted text-white shadow-[0_0_22px_rgba(67,207,110,0.35)]' : 'bg-accentGlow text-accentMuted'
                }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              <Sparkles className="h-4 w-4" />
              Modalita OP {isCheatPeekActive ? 'attiva' : 'pronta'}
            </motion.span>
          ) : (
            <span className="text-sm text-textMuted">
              Premi <kbd className="rounded bg-surfaceSoft px-1.5 py-0.5 text-xs">Alt</kbd> + <kbd className="rounded bg-surfaceSoft px-1.5 py-0.5 text-xs">C</kbd>
              <kbd className="rounded bg-surfaceSoft px-1.5 py-0.5 text-xs">I</kbd>
              <kbd className="rounded bg-surfaceSoft px-1.5 py-0.5 text-xs">A</kbd>
              <kbd className="rounded bg-surfaceSoft px-1.5 py-0.5 text-xs">O</kbd> per sbloccare la modalita OP
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-accentGlow/50 bg-white px-4 py-2 text-sm font-semibold text-accentMuted transition hover:border-accentMuted/45 hover:bg-accentGlow/60 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onHint}
            disabled={disableHint}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles className="h-4 w-4" />
            {pluralize(stats.hintsAvailable, 'aiuto', 'aiuti')}
          </motion.button>

          <motion.button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentMuted disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onReset}
            disabled={disableReset}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCcw className="h-4 w-4" />
            Nuova partita
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const StatPill = ({
  icon,
  label,
  caption
}: {
  icon: ReactNode;
  label: string;
  caption: string;
}) => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-surfaceSoft bg-surfaceHighlight p-2 text-center shadow-soft md:inline-flex md:flex-row md:gap-3 md:px-4 md:py-2 md:text-left">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-soft md:h-8 md:w-8">{icon}</span>
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-[0.25em] text-textMuted/70 md:text-xs">{caption}</span>
      <span className="text-sm font-semibold text-textPrimary tabular-nums md:text-lg">{label}</span>
    </div>
  </div>
);
