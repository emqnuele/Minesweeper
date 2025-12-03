import { Cell } from '../types';

export const getNeighbors = (
  row: number,
  col: number,
  rows: number,
  columns: number
): Array<[number, number]> => {
  const neighbors: Array<[number, number]> = [];

  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (r === row && c === col) continue;
      if (r < 0 || c < 0 || r >= rows || c >= columns) continue;
      neighbors.push([r, c]);
    }
  }

  return neighbors;
};

export const createEmptyBoard = (rows: number, columns: number): Cell[][] => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, col) => ({
      id: `${row}-${col}`,
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      isQuestioned: false,
      adjacentMines: 0,
      isExploded: false,
      isHinted: false
    }))
  );
};

export const scatterMines = (
  board: Cell[][],
  mines: number,
  safeCells: Set<string>
): void => {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;

  let placed = 0;
  while (placed < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * columns);
    const cell = board[row][col];

    if (cell.isMine || safeCells.has(cell.id)) continue;

    cell.isMine = true;
    placed += 1;
  }
};

export const annotateBoard = (board: Cell[][]): void => {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = board[row][col];
      if (cell.isMine) continue;

      const neighbors = getNeighbors(row, col, rows, columns);
      let count = 0;
      neighbors.forEach(([nr, nc]) => {
        if (board[nr][nc].isMine) count += 1;
      });
      cell.adjacentMines = count;
    }
  }
};

export const cloneBoard = (board: Cell[][]): Cell[][] =>
  board.map((row) => row.map((cell) => ({ ...cell })));
