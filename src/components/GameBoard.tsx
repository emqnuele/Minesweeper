import { AnimatePresence, motion } from 'framer-motion';
import { Bomb, Flag, HelpCircle, MousePointerClick, PartyPopper } from 'lucide-react';
import { memo, useMemo } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Cell, GameStatus } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';

const numberColorMap: Record<number, string> = {
  1: 'text-sky-600',
  2: 'text-emerald-600',
  3: 'text-rose-600',
  4: 'text-indigo-600',
  5: 'text-orange-600',
  6: 'text-cyan-600',
  7: 'text-fuchsia-600',
  8: 'text-lime-600'
};

interface GameBoardProps {
  board: Cell[][];
  status: GameStatus;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  cheatPeek?: boolean;
  opMode?: boolean;
}

const CellButton = memo(
  ({
    cell,
    onReveal,
    onToggleFlag,
    onChord,
    size,
    cheatPeek = false
  }: {
    cell: Cell;
    onReveal: () => void;
    onToggleFlag: () => void;
    onChord: () => void;
    size: number;
    cheatPeek?: boolean;
  }) => {
    const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onToggleFlag();
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (event.shiftKey || event.altKey) {
        onToggleFlag();
        return;
      }
      onReveal();
    };

    const handleDoubleClick = () => {
      onChord();
    };

    const shouldShowActual = cheatPeek || cell.isRevealed || cell.isExploded;
    const isTemporaryReveal = cheatPeek && !cell.isRevealed && !cell.isExploded;

    const content = useMemo(() => {
      if (shouldShowActual) {
        if (cell.isMine) {
          return <Bomb className="h-5 w-5 text-danger drop-shadow-[0_0_8px_rgba(248,113,113,0.7)]" />;
        }
        if (cell.adjacentMines > 0) {
          const colorClass = numberColorMap[cell.adjacentMines] ?? 'text-textPrimary';
          return (
            <span className={`text-lg font-semibold ${colorClass}`} aria-hidden>
              {cell.adjacentMines}
            </span>
          );
        }
        return null;
      }

      if (cell.isFlagged) {
        return <Flag className="h-5 w-5 text-accentMuted drop-shadow-[0_0_12px_rgba(67,207,110,0.45)]" />;
      }
      if (cell.isQuestioned) {
        return <HelpCircle className="h-5 w-5 text-textMuted" />;
      }
      return null;
    }, [cell, shouldShowActual]);

    const ariaLabel = useMemo(() => {
      if (cell.isFlagged) return `Bandierina sulla cella ${cell.row + 1}, ${cell.col + 1}`;
      if (cell.isQuestioned) return `Cella incerta ${cell.row + 1}, ${cell.col + 1}`;
      if (!cell.isRevealed) return `Cella coperta ${cell.row + 1}, ${cell.col + 1}`;
      if (cell.isMine) return `Mina rivelata ${cell.row + 1}, ${cell.col + 1}`;
      return `Numero ${cell.adjacentMines} alla cella ${cell.row + 1}, ${cell.col + 1}`;
    }, [cell]);

    const baseClasses =
      'relative isolate flex items-center justify-center border border-surfaceSoft/80 rounded-xl text-base font-semibold transition-all duration-150';

    const unrevealedClasses =
      'bg-surfaceSoft hover:bg-accentSoft/70 hover:-translate-y-0.5 active:translate-y-0 shadow-surface';

    const revealedClasses =
      'bg-white border-surfaceSoft text-textPrimary shadow-inner shadow-surface';

    return (
      <motion.button
        key={cell.id}
        layout="position"
        aria-label={ariaLabel}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        className={`${baseClasses} ${(cell.isRevealed || cheatPeek) ? revealedClasses : unrevealedClasses} ${cell.isExploded ? 'animate-pulse bg-danger/10 border-danger/50' : ''
          } ${cell.isHinted ? 'outline outline-2 outline-accentMuted/60 shadow-glass' : ''} ${isTemporaryReveal ? 'ring-1 ring-accentMuted/40 bg-accentSoft/70 backdrop-blur-sm' : ''
          }`}
        style={{ width: size, height: size }}
        initial={false}
        whileHover={!cell.isRevealed ? { scale: 1.02 } : undefined}
        whileTap={!cell.isRevealed ? { scale: 0.98 } : undefined}
        disabled={cell.isRevealed}
      >
        <AnimatePresence mode="wait">
          {content ? (
            <motion.span
              key={`${cell.id}-content`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {content}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
    );
  }
);

CellButton.displayName = 'CellButton';

export const GameBoard = ({
  board,
  status,
  onReveal,
  onToggleFlag,
  onChord,
  cheatPeek = false,
  opMode = false
}: GameBoardProps) => {
  const columns = board[0]?.length ?? 0;
  const rows = board.length;

  const isMobile = useMediaQuery('(max-width: 768px)');

  const cellSize = useMemo(() => {
    const maxDimension = Math.max(rows, columns);

    if (isMobile) {
      if (maxDimension <= 8) return 48;
      if (maxDimension <= 12) return 40;
      if (maxDimension <= 16) return 34;
      if (maxDimension <= 22) return 30;
      if (maxDimension <= 28) return 26;
      return 24;
    }

    if (maxDimension <= 8) return 76;
    if (maxDimension <= 12) return 64;
    if (maxDimension <= 16) return 56;
    if (maxDimension <= 22) return 48;
    if (maxDimension <= 28) return 42;
    return 36;
  }, [columns, rows, isMobile]);

  const boardStyle = useMemo<CSSProperties>(
    () => ({
      gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
      gridAutoRows: `${cellSize}px`
    }),
    [cellSize, columns]
  );

  if (rows === 0 || columns === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-surfaceSoft bg-surfaceHighlight p-12 text-textMuted shadow-soft">
        <div className="flex flex-col items-center gap-4 text-center">
          <MousePointerClick className="h-10 w-10 text-accentMuted" />
          <p>Scegli la configurazione nella home e premi “Inizia la partita” per generare il campo.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative max-w-full overflow-auto rounded-3xl border border-surfaceSoft bg-surfaceHighlight p-5 shadow-[0_40px_85px_-42px_rgba(67,207,110,0.45)] ${opMode ? 'ring-1 ring-accentMuted/40' : ''
        }`}
    >
      <div className="grid gap-2 w-max mx-auto" style={boardStyle}>
        {board.flat().map((cell) => (
          <CellButton
            key={cell.id}
            cell={cell}
            onReveal={() => onReveal(cell.row, cell.col)}
            onToggleFlag={() => onToggleFlag(cell.row, cell.col)}
            onChord={() => onChord(cell.row, cell.col)}
            size={cellSize}
            cheatPeek={cheatPeek}
          />
        ))}
      </div>

      <AnimatePresence>
        {cheatPeek ? (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,_rgba(50,193,108,0.3),transparent_70%)] opacity-70 mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {status === 'won' ? (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-glass"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
            >
              <PartyPopper className="h-5 w-5 text-accentMuted" />
              <span className="text-lg font-semibold text-textPrimary">Hai vinto! Nessuna mina ti resiste.</span>
            </motion.div>
          </motion.div>
        ) : status === 'lost' ? (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-glass"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Bomb className="h-5 w-5 text-danger" />
              <span className="text-lg font-semibold text-danger">
                Boom! Una mina e esplosa, ma puoi sempre riprovarci.
              </span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
