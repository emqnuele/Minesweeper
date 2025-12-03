import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { GameBoard } from './components/GameBoard';
import { StatsPanel } from './components/StatsPanel';
import { DIFFICULTIES } from './constants';
import { useMinesweeper } from './hooks/useMinesweeper';
import { GameConfig, GameStatus } from './types';

const statusCopy: Record<GameStatus, string> = {
  idle: 'Configura le impostazioni per iniziare',
  ready: 'Pronto! Effettua la prima mossa',
  playing: 'In corso - occhio alle mine',
  won: 'Hai liberato il campo!',
  lost: 'Una mina e esplosa'
};

const gradientBackdrop =
  'absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(189,243,204,0.55),transparent_60%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.9),transparent_55%)]';

const SECRET_SEQUENCE = ['c', 'i', 'a', 'o'] as const;

const App = () => {
  const [view, setView] = useState<'home' | 'game'>('home');
  const [difficultyId, setDifficultyId] = useState<typeof DIFFICULTIES[number]['id']>('beginner');
  const [customConfig, setCustomConfig] = useState<GameConfig>(DIFFICULTIES.find((d) => d.id === 'custom')!.config);
  const [isOpMode, setIsOpMode] = useState(false);
  const [isCheatPeekActive, setIsCheatPeekActive] = useState(false);
  const sequenceIndexRef = useRef(0);
  const sequenceTimeoutRef = useRef<number | null>(null);

  const selectedDifficulty = useMemo(
    () => DIFFICULTIES.find((d) => d.id === difficultyId) ?? DIFFICULTIES[0],
    [difficultyId]
  );

  const currentConfig = useMemo<GameConfig>(
    () => (selectedDifficulty.id === 'custom' ? customConfig : selectedDifficulty.config),
    [customConfig, selectedDifficulty]
  );

  const { board, stats, revealCell, toggleFlag, chordCell, useHint, reset, primeCheatBoard } = useMinesweeper(currentConfig);

  const handleStart = () => {
    reset();
    setView('game');
  };

  const handleReturnHome = () => {
    setIsOpMode(false);
    setIsCheatPeekActive(false);
    reset();
    setView('home');
  };

  const handleHint = () => {
    if (stats.hintsAvailable > 0) {
      useHint();
    }
  };

  useEffect(() => {
    if (view !== 'game') return;

    const resetSequence = () => {
      sequenceIndexRef.current = 0;
      if (sequenceTimeoutRef.current !== null) {
        window.clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputTarget =
        target !== null &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.getAttribute('role') === 'textbox');

      if (event.key === 'Tab' && isOpMode) {
        if (!isInputTarget) {
          event.preventDefault();
          setIsCheatPeekActive(true);
        }
      }

      if (!event.altKey) {
        resetSequence();
        return;
      }

      const key = event.key.toLowerCase();
      if (!SECRET_SEQUENCE.includes(key as (typeof SECRET_SEQUENCE)[number])) {
        resetSequence();
        return;
      }

      if (key === SECRET_SEQUENCE[sequenceIndexRef.current]) {
        sequenceIndexRef.current += 1;

        if (sequenceIndexRef.current === SECRET_SEQUENCE.length) {
          setIsOpMode((prev) => {
            if (prev) {
              setIsCheatPeekActive(false);
            }
            return !prev;
          });
          resetSequence();
        } else {
          if (sequenceTimeoutRef.current !== null) {
            window.clearTimeout(sequenceTimeoutRef.current);
          }
          sequenceTimeoutRef.current = window.setTimeout(resetSequence, 1200);
        }
      } else if (key === SECRET_SEQUENCE[0]) {
        sequenceIndexRef.current = 1;
        if (sequenceTimeoutRef.current !== null) {
          window.clearTimeout(sequenceTimeoutRef.current);
        }
        sequenceTimeoutRef.current = window.setTimeout(resetSequence, 1200);
      } else {
        resetSequence();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsCheatPeekActive(false);
      }
      if (event.key === 'Alt') {
        resetSequence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      resetSequence();
    };
  }, [isOpMode, view]);

  useEffect(() => {
    if (!isOpMode) {
      setIsCheatPeekActive(false);
    }
  }, [isOpMode]);

  useEffect(() => {
    if (isCheatPeekActive) {
      primeCheatBoard();
    }
  }, [isCheatPeekActive, primeCheatBoard]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-textPrimary">
      <div className={gradientBackdrop} />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 md:px-8 lg:px-12">
        {view === 'home' ? (
          <motion.main
            className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:gap-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col items-center text-center gap-4 md:items-start md:text-left md:gap-6">
              <motion.span
                className="inline-flex max-w-max items-center gap-2 rounded-full bg-accentSoft px-3 py-1.5 text-xs font-semibold text-accentMuted shadow-soft md:px-4 md:py-2 md:text-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accentMuted md:h-2 md:w-2" />
                Nuova stagione competitiva
              </motion.span>
              <motion.h1
                className="text-3xl font-semibold leading-tight text-textPrimary md:text-4xl lg:text-5xl"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                Campo Minato, stile classico con vibes da prato fresco.
              </motion.h1>
              <motion.p
                className="max-w-xl text-base text-textMuted mx-auto md:mx-0 md:text-lg"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Scegli la tua configurazione favorita, definisci la strategia e preparati a scoprire il campo. Ogni partita
                inizia con un click, ma solo gli occhi piu attenti evitano le mine.
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center gap-2 text-xs text-textMuted md:justify-start md:gap-3 md:text-sm"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-surfaceHighlight px-2.5 py-1.5 shadow-soft md:px-3 md:py-2">
                  Campo personalizzabile
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-surfaceHighlight px-2.5 py-1.5 shadow-soft md:px-3 md:py-2">
                  Animazioni fluide
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-surfaceHighlight px-2.5 py-1.5 shadow-soft md:px-3 md:py-2">
                  Modalita OP segreta
                </span>
              </motion.div>
            </div>
            <ControlPanel
              selectedDifficulty={selectedDifficulty}
              customConfig={customConfig}
              onSelectDifficulty={setDifficultyId}
              onCustomConfigChange={setCustomConfig}
              onStart={handleStart}
              status={stats.status}
              variant="home"
            />
          </motion.main>
        ) : (
          <motion.main
            className="flex flex-1 flex-col gap-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-4 rounded-3xl bg-surfaceHighlight px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between md:gap-3 md:px-6">
              <div className="flex items-center justify-between gap-4 md:justify-start">
                <motion.button
                  type="button"
                  onClick={handleReturnHome}
                  className="inline-flex items-center gap-2 rounded-full border border-accentGlow/60 bg-white px-3 py-2 text-sm font-semibold text-accentMuted transition hover:border-accentMuted/45 hover:bg-accentSoft md:px-4"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="md:hidden">←</span>
                  <span className="hidden md:inline">Indietro alla lobby</span>
                </motion.button>
                <div className="text-right md:text-left">
                  <p className="hidden text-xs uppercase tracking-[0.35em] text-textMuted/70 md:block">Partita attuale</p>
                  <h2 className="text-lg font-semibold text-textPrimary md:text-xl">
                    {selectedDifficulty.name} <span className="text-textMuted">·</span> {currentConfig.rows}x{currentConfig.columns}
                  </h2>
                </div>
              </div>
              <motion.div
                className="hidden items-center gap-3 rounded-full bg-accentSoft px-4 py-2 text-sm font-semibold text-accentMuted shadow-soft md:inline-flex"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                Mine totali: {currentConfig.mines}
              </motion.div>
            </div>

            <StatsPanel
              stats={stats}
              statusLabel={statusCopy[stats.status]}
              onReset={() => {
                setIsCheatPeekActive(false);
                reset();
              }}
              onHint={handleHint}
              disableHint={stats.hintsAvailable === 0 || stats.status !== 'playing'}
              disableReset={false}
              isOpMode={isOpMode}
              isCheatPeekActive={isCheatPeekActive}
            />

            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <GameBoard
                board={board}
                status={stats.status}
                onReveal={revealCell}
                onToggleFlag={toggleFlag}
                onChord={chordCell}
                cheatPeek={isOpMode && isCheatPeekActive}
                opMode={isOpMode}
              />
              <div className="rounded-full bg-surface px-4 py-2 text-sm text-textMuted shadow-surface">
                Controlli: click sinistro per scoprire · destro o Shift+click per bandierina · doppio click per chording
              </div>
            </motion.div>
          </motion.main>
        )}
      </div>
    </div>
  );
};

export default App;
