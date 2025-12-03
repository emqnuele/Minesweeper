import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { createEmptyBoard, scatterMines, annotateBoard, getNeighbors, cloneBoard } from '../utils/board';
import { Cell, GameConfig, GameStats, GameStatus } from '../types';

interface GameState {
  board: Cell[][];
  status: GameStatus;
  flagsLeft: number;
  revealedCells: number;
  mistakes: number;
  hintsAvailable: number;
  config: GameConfig;
  startTimestamp: number | null;
  timeMs: number;
}

type Action =
  | { type: 'RESET'; config: GameConfig }
  | { type: 'REVEAL'; row: number; col: number; timestamp: number }
  | { type: 'TOGGLE_FLAG'; row: number; col: number }
  | { type: 'CHORD'; row: number; col: number; timestamp: number }
  | { type: 'HINT'; timestamp: number }
  | { type: 'TICK'; timestamp: number }
  | { type: 'CHEAT_PRIME' };

interface InternalRevealResult {
  board: Cell[][];
  revealed: number;
  status: GameStatus;
  mistakesIncrement: number;
}

const floodReveal = (board: Cell[][], startRow: number, startCol: number): number => {
  const queue: Array<[number, number]> = [[startRow, startCol]];
  const visited = new Set<string>();
  let revealed = 0;

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const cell = board[row][col];
    const key = `${row}-${col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (cell.isRevealed || cell.isFlagged) continue;

    cell.isRevealed = true;
    cell.isQuestioned = false;
    cell.isHinted = false;
    revealed += 1;

    if (cell.adjacentMines === 0 && !cell.isMine) {
      const neighbors = getNeighbors(row, col, board.length, board[0].length);
      neighbors.forEach(([nr, nc]) => {
        const neighborCell = board[nr][nc];
        if (!neighborCell.isRevealed && !neighborCell.isMine) {
          queue.push([nr, nc]);
        }
      });
    }
  }

  return revealed;
};

const exposeAllMines = (board: Cell[][]): void => {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.isMine) {
        cell.isRevealed = true;
        cell.isFlagged = false;
        cell.isQuestioned = false;
      }
    });
  });
};

const ZERO_CLUSTER_THRESHOLD = 23;
const MAX_GENERATION_ATTEMPTS = 40;

const getLargestZeroClusterRatio = (board: Cell[][], mines: number): number => {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;

  if (rows === 0 || columns === 0) return 0;

  const visited = new Set<string>();
  let largestCluster = 0;
  let totalZeroCells = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = board[row][col];
      if (cell.isMine || cell.adjacentMines !== 0) continue;

      totalZeroCells += 1;
      const id = `${row}-${col}`;
      if (visited.has(id)) continue;

      let clusterSize = 0;
      const queue: Array<[number, number]> = [[row, col]];

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        const currentId = `${cr}-${cc}`;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        clusterSize += 1;

        const neighbors = getNeighbors(cr, cc, rows, columns);
        neighbors.forEach(([nr, nc]) => {
          const neighbor = board[nr][nc];
          if (!neighbor.isMine && neighbor.adjacentMines === 0 && !visited.has(`${nr}-${nc}`)) {
            queue.push([nr, nc]);
          }
        });
      }

      if (clusterSize > largestCluster) {
        largestCluster = clusterSize;
      }
    }
  }

  const safeCells = rows * columns - mines;
  if (safeCells <= 0) return 0;

  const zeroRatio = totalZeroCells / safeCells;
  const clusterRatio = largestCluster / safeCells;

  return Math.max(zeroRatio, clusterRatio);
};

const rebalanceZeroClusters = (board: Cell[][], mines: number, safeCells: Set<string>): void => {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;
  if (rows === 0 || columns === 0) return;

  const maxIterations = rows * columns * 2;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const clusterRatio = getLargestZeroClusterRatio(board, mines);
    if (clusterRatio <= ZERO_CLUSTER_THRESHOLD) {
      break;
    }

    const zeroCandidates = board
      .flat()
      .filter((cell) => !cell.isMine && cell.adjacentMines === 0 && !safeCells.has(cell.id));

    const mineCandidates = board.flat().filter((cell) => cell.isMine && !safeCells.has(cell.id));

    if (zeroCandidates.length === 0 || mineCandidates.length === 0) {
      break;
    }

    const targetIndex = Math.floor(Math.random() * zeroCandidates.length);
    const targetZero = zeroCandidates[targetIndex];

    const availableMines = mineCandidates.filter((cell) => cell.id !== targetZero.id);
    if (availableMines.length === 0) {
      break;
    }

    const mineIndex = Math.floor(Math.random() * availableMines.length);
    const mineToRemove = availableMines[mineIndex];

    targetZero.isMine = true;
    mineToRemove.isMine = false;

    annotateBoard(board);
  }
};

const generateBalancedBoard = (
  rows: number,
  columns: number,
  mines: number,
  safeCells: Set<string>
): Cell[][] => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = createEmptyBoard(rows, columns);
    scatterMines(candidate, mines, safeCells);
    annotateBoard(candidate);
    rebalanceZeroClusters(candidate, mines, safeCells);

    if (getLargestZeroClusterRatio(candidate, mines) <= ZERO_CLUSTER_THRESHOLD) {
      return candidate;
    }
  }

  const fallback = createEmptyBoard(rows, columns);
  scatterMines(fallback, mines, safeCells);
  annotateBoard(fallback);
  rebalanceZeroClusters(fallback, mines, safeCells);
  return fallback;
};

const ensureBoardWithMines = (
  state: GameState,
  row: number,
  col: number
): { board: Cell[][]; generated: boolean } => {
  if (state.status !== 'ready') {
    return { board: cloneBoard(state.board), generated: false };
  }

  const { rows, columns, mines, safeStart } = state.config;
  const safeCells = new Set<string>();

  if (safeStart) {
    safeCells.add(`${row}-${col}`);
  }

  const hasExistingMines = state.board.some((r) => r.some((cell) => cell.isMine));

  if (!hasExistingMines) {
    const balancedBoard = generateBalancedBoard(rows, columns, mines, safeCells);
    return { board: cloneBoard(balancedBoard), generated: true };
  }

  const adjustedBoard = cloneBoard(state.board);

  adjustedBoard.forEach((boardRow) =>
    boardRow.forEach((cell) => {
      cell.isRevealed = false;
      cell.isFlagged = false;
      cell.isQuestioned = false;
      cell.isExploded = false;
      cell.isHinted = false;
    })
  );

  let relocatedMines = 0;

  if (safeStart && safeCells.size > 0) {
    adjustedBoard.forEach((boardRow) =>
      boardRow.forEach((cell) => {
        if (safeCells.has(cell.id) && cell.isMine) {
          cell.isMine = false;
          relocatedMines += 1;
        }
      })
    );
  }

  if (relocatedMines > 0) {
    const candidates = adjustedBoard.flat().filter((cell) => !cell.isMine && !safeCells.has(cell.id));
    let remainingToPlace = relocatedMines;

    while (remainingToPlace > 0) {
      if (candidates.length === 0) {
        const freshBoard = createEmptyBoard(rows, columns);
        scatterMines(freshBoard, mines, safeCells);
        annotateBoard(freshBoard);
        return { board: cloneBoard(freshBoard), generated: true };
      }

      const index = Math.floor(Math.random() * candidates.length);
      const targetCell = candidates.splice(index, 1)[0];
      targetCell.isMine = true;
      remainingToPlace -= 1;
    }
  }

  annotateBoard(adjustedBoard);
  rebalanceZeroClusters(adjustedBoard, mines, safeCells);

  const adjustedMineCount = adjustedBoard.reduce(
    (acc, boardRow) => acc + boardRow.reduce((rowAcc, cell) => rowAcc + (cell.isMine ? 1 : 0), 0),
    0
  );

  if (adjustedMineCount !== mines) {
    const regenerated = generateBalancedBoard(rows, columns, mines, safeCells);
    return { board: cloneBoard(regenerated), generated: true };
  }

  const zeroClusterRatio = getLargestZeroClusterRatio(adjustedBoard, mines);
  if (zeroClusterRatio > ZERO_CLUSTER_THRESHOLD) {
    const regenerated = generateBalancedBoard(rows, columns, mines, safeCells);
    return { board: cloneBoard(regenerated), generated: true };
  }

  return { board: adjustedBoard, generated: true };
};

const revealAtPosition = (
  state: GameState,
  row: number,
  col: number,
  timestamp: number
): InternalRevealResult => {
  const { board: preparedBoard, generated } = ensureBoardWithMines(state, row, col);
  const workingBoard = preparedBoard;
  const target = workingBoard[row][col];
  const nextState: InternalRevealResult = {
    board: workingBoard,
    revealed: 0,
    status: generated ? 'playing' : state.status,
    mistakesIncrement: 0
  };

  if (target.isRevealed || target.isFlagged) {
    return {
      board: workingBoard,
      revealed: 0,
      status: generated ? 'playing' : state.status,
      mistakesIncrement: 0
    };
  }

  if (target.isMine) {
    target.isExploded = true;
    exposeAllMines(workingBoard);
    nextState.status = 'lost';
    nextState.mistakesIncrement = 1;
    // Freeze time - handled by reducer using timestamp.
    return nextState;
  }

  const newlyRevealed = floodReveal(workingBoard, row, col);
  nextState.revealed = newlyRevealed;

  const totalCells = state.config.rows * state.config.columns;
  const totalRevealed = state.revealedCells + newlyRevealed;
  if (totalRevealed === totalCells - state.config.mines) {
    // Reveal all flags correctly
    workingBoard.forEach((r) =>
      r.forEach((cell) => {
        if (cell.isMine) cell.isFlagged = true;
      })
    );
    nextState.status = 'won';
  } else if (nextState.status !== 'lost') {
    nextState.status = 'playing';
  }

  return nextState;
};

const chordReveal = (
  state: GameState,
  row: number,
  col: number,
  timestamp: number
): InternalRevealResult => {
  const workingBoard = cloneBoard(state.board);
  const target = workingBoard[row][col];
  const result: InternalRevealResult = {
    board: workingBoard,
    revealed: 0,
    status: state.status,
    mistakesIncrement: 0
  };

  if (!target.isRevealed || target.isMine || !state.config.allowChord) {
    return result;
  }

  const neighbors = getNeighbors(row, col, workingBoard.length, workingBoard[0].length);
  const flaggedCount = neighbors.reduce((acc, [nr, nc]) => {
    return acc + (workingBoard[nr][nc].isFlagged ? 1 : 0);
  }, 0);

  if (flaggedCount !== target.adjacentMines) {
    return result;
  }

  let mistakesIncrement = 0;
  let totalRevealed = 0;
  let hitMine = false;

  neighbors.forEach(([nr, nc]) => {
    const neighbor = workingBoard[nr][nc];
    if (!neighbor.isFlagged && !neighbor.isRevealed) {
      if (neighbor.isMine) {
        neighbor.isExploded = true;
        hitMine = true;
      } else {
        totalRevealed += floodReveal(workingBoard, nr, nc);
      }
    }
  });

  if (hitMine) {
    exposeAllMines(workingBoard);
    mistakesIncrement += 1;
    result.status = 'lost';
  } else if (totalRevealed > 0) {
    const totalCells = state.config.rows * state.config.columns;
    const revealedTotal = state.revealedCells + totalRevealed;
    if (revealedTotal === totalCells - state.config.mines) {
      workingBoard.forEach((r) =>
        r.forEach((cell) => {
          if (cell.isMine) cell.isFlagged = true;
        })
      );
      result.status = 'won';
    } else {
      result.status = 'playing';
    }
  }

  result.revealed = totalRevealed;
  result.mistakesIncrement = mistakesIncrement;

  return result;
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'RESET': {
      return {
        board: createEmptyBoard(action.config.rows, action.config.columns),
        status: 'ready',
        flagsLeft: action.config.mines,
        revealedCells: 0,
        mistakes: 0,
        hintsAvailable: 3,
        config: action.config,
        startTimestamp: null,
        timeMs: 0
      };
    }

    case 'REVEAL': {
      if (state.status === 'lost' || state.status === 'won') {
        return state;
      }

      const preparedState: GameState =
        state.status === 'ready'
          ? {
              ...state,
              board: createEmptyBoard(state.config.rows, state.config.columns)
            }
          : state;

      const result = revealAtPosition(preparedState, action.row, action.col, action.timestamp);
      const shouldStartTimer = state.startTimestamp === null && result.status === 'playing';

      return {
        ...preparedState,
        board: result.board,
        status: result.status,
        revealedCells: preparedState.revealedCells + result.revealed,
        mistakes: preparedState.mistakes + result.mistakesIncrement,
        flagsLeft: result.status === 'won' ? 0 : preparedState.flagsLeft,
        startTimestamp: shouldStartTimer ? action.timestamp : preparedState.startTimestamp,
        timeMs:
          result.status === 'won' || result.status === 'lost'
            ? preparedState.startTimestamp
              ? action.timestamp - preparedState.startTimestamp
              : preparedState.timeMs
            : preparedState.timeMs
      };
    }

    case 'TOGGLE_FLAG': {
      if (state.status === 'lost' || state.status === 'won') {
        return state;
      }

      const workingBoard = cloneBoard(state.board);
      const cell = workingBoard[action.row][action.col];

      if (cell.isRevealed) {
        return state;
      }

      let flagsLeft = state.flagsLeft;
      if (!cell.isFlagged && !cell.isQuestioned) {
        if (flagsLeft === 0) return state;
        cell.isFlagged = true;
        flagsLeft -= 1;
      } else if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsLeft += 1;
        if (state.config.allowQuestionMark) {
          cell.isQuestioned = true;
        }
      } else if (cell.isQuestioned) {
        cell.isQuestioned = false;
      }

      return {
        ...state,
        board: workingBoard,
        flagsLeft
      };
    }

    case 'CHORD': {
      if (state.status !== 'playing') {
        return state;
      }

      const result = chordReveal(state, action.row, action.col, action.timestamp);
      return {
        ...state,
        board: result.board,
        status: result.status,
        revealedCells: state.revealedCells + result.revealed,
        mistakes: state.mistakes + result.mistakesIncrement,
        timeMs:
          result.status === 'won' || result.status === 'lost'
            ? state.startTimestamp
              ? action.timestamp - state.startTimestamp
              : state.timeMs
            : state.timeMs
      };
    }

    case 'HINT': {
      if (state.status !== 'playing' || state.hintsAvailable <= 0) {
        return state;
      }

      const workingBoard = cloneBoard(state.board);
      const hiddenSafeCells: Cell[] = [];

      workingBoard.forEach((row) => {
        row.forEach((cell) => {
          if (!cell.isMine && !cell.isRevealed && !cell.isFlagged) {
            hiddenSafeCells.push(cell);
          }
        });
      });

      if (hiddenSafeCells.length === 0) {
        return state;
      }

      const randomIndex = Math.floor(Math.random() * hiddenSafeCells.length);
      const hintCell = hiddenSafeCells[randomIndex];
      const hintedBoard = cloneBoard(workingBoard);
      const cellToReveal = hintedBoard[hintCell.row][hintCell.col];
      cellToReveal.isHinted = true;

      const result = revealAtPosition(
        {
          ...state,
          board: hintedBoard
        },
        hintCell.row,
        hintCell.col,
        action.timestamp
      );

      return {
        ...state,
        board: result.board,
        status: result.status,
        revealedCells: state.revealedCells + result.revealed,
        mistakes: state.mistakes + result.mistakesIncrement,
        hintsAvailable: state.hintsAvailable - 1,
        timeMs:
          result.status === 'won'
            ? state.startTimestamp
              ? action.timestamp - state.startTimestamp
              : state.timeMs
            : state.timeMs
      };
    }

    case 'TICK': {
      if (state.status !== 'playing' || state.startTimestamp === null) {
        return state;
      }

      return {
        ...state,
        timeMs: action.timestamp - state.startTimestamp
      };
    }

    case 'CHEAT_PRIME': {
      if (state.status !== 'ready') {
        return state;
      }

      const hasMines = state.board.some((row) => row.some((cell) => cell.isMine));
      if (hasMines) {
        return state;
      }

      const { rows, columns, mines } = state.config;
      const board = generateBalancedBoard(rows, columns, mines, new Set());

      return {
        ...state,
        board
      };
    }

    default:
      return state;
  }
};

const initialState = (config: GameConfig): GameState => ({
  board: [] as Cell[][],
  status: 'idle',
  flagsLeft: config.mines,
  revealedCells: 0,
  mistakes: 0,
  hintsAvailable: 3,
  config,
  startTimestamp: null,
  timeMs: 0
});

export const useMinesweeper = (config: GameConfig) => {
  const [state, dispatch] = useReducer(reducer, config, initialState);
  const isFirstConfigRun = useRef(true);

  // Reset when config reference changes.
  useEffect(() => {
    if (isFirstConfigRun.current) {
      isFirstConfigRun.current = false;
      return;
    }
    dispatch({ type: 'RESET', config });
  }, [config]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = window.setInterval(() => {
      dispatch({ type: 'TICK', timestamp: performance.now() });
    }, 100);

    return () => window.clearInterval(interval);
  }, [state.status]);

  const revealCell = useCallback(
    (row: number, col: number) => {
      dispatch({ type: 'REVEAL', row, col, timestamp: performance.now() });
    },
    [dispatch]
  );

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      dispatch({ type: 'TOGGLE_FLAG', row, col });
    },
    [dispatch]
  );

  const chordCell = useCallback(
    (row: number, col: number) => {
      dispatch({ type: 'CHORD', row, col, timestamp: performance.now() });
    },
    [dispatch]
  );

  const useHint = useCallback(() => {
    dispatch({ type: 'HINT', timestamp: performance.now() });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', config });
  }, [config]);

  const primeCheatBoard = useCallback(() => {
    dispatch({ type: 'CHEAT_PRIME' });
  }, [dispatch]);

  const stats: GameStats = useMemo(
    () => ({
      status: state.status,
      flagsLeft: state.flagsLeft,
      revealedCells: state.revealedCells,
      mistakes: state.mistakes,
      hintsAvailable: state.hintsAvailable,
      timeMs: state.timeMs
    }),
    [state.flagsLeft, state.hintsAvailable, state.mistakes, state.revealedCells, state.status, state.timeMs]
  );

  return {
    board: state.board,
    config: state.config,
    stats,
    revealCell,
    toggleFlag,
    chordCell,
    useHint,
    reset,
    primeCheatBoard
  };
};
