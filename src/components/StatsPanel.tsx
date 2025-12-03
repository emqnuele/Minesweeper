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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted/70">Stato</p>
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${statusBadgeClasses[stats.status]}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatPill icon={<Clock className="h-4 w-4 text-accentMuted" />} label={formatTime(stats.timeMs)} caption="Tempo" />
          <StatPill
            icon={<Bomb className="h-4 w-4 text-danger" />}
            label={stats.flagsLeft.toString()}
            caption="Mine rimanenti"
          />
          <StatPill
            icon={<Brain className="h-4 w-4 text-warning" />}
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                isCheatPeekActive ? 'bg-accentMuted text-white shadow-[0_0_22px_rgba(67,207,110,0.35)]' : 'bg-accentGlow text-accentMuted'
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
  <div className="inline-flex items-center gap-3 rounded-2xl border border-surfaceSoft bg-surfaceHighlight px-4 py-2 shadow-soft">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-soft">{icon}</span>
    <div className="flex flex-col leading-tight">
      <span className="text-xs uppercase tracking-[0.25em] text-textMuted/70">{caption}</span>
      <span className="text-lg font-semibold text-textPrimary tabular-nums">{label}</span>
    </div>
  </div>
);
