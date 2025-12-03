export type GameStatus = 'idle' | 'ready' | 'playing' | 'won' | 'lost';

export interface Cell {
  id: string;
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestioned: boolean;
  adjacentMines: number;
  isExploded: boolean;
  isHinted: boolean;
}

export interface GameConfig {
  rows: number;
  columns: number;
  mines: number;
  safeStart: boolean;
  allowChord: boolean;
  allowQuestionMark: boolean;
}

export interface GameStats {
  status: GameStatus;
  flagsLeft: number;
  revealedCells: number;
  mistakes: number;
  hintsAvailable: number;
  timeMs: number;
}

export interface DifficultyOption {
  id: 'beginner' | 'intermediate' | 'expert' | 'custom';
  name: string;
  description: string;
  config: GameConfig;
}
