import { DifficultyOption } from './types';

export const DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'beginner',
    name: 'Principiante',
    description: '9 × 9 con 10 mine — perfetto per iniziare',
    config: {
      rows: 9,
      columns: 9,
      mines: 10,
      safeStart: true,
      allowChord: true,
      allowQuestionMark: true
    }
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    description: '16 × 16 con 40 mine — sfida classica',
    config: {
      rows: 16,
      columns: 16,
      mines: 40,
      safeStart: true,
      allowChord: true,
      allowQuestionMark: true
    }
  },
  {
    id: 'expert',
    name: 'Esperto',
    description: '30 × 16 con 99 mine — serve sangue freddo',
    config: {
      rows: 16,
      columns: 30,
      mines: 99,
      safeStart: true,
      allowChord: true,
      allowQuestionMark: true
    }
  },
  {
    id: 'custom',
    name: 'Personalizzato',
    description: 'Scegli tu griglia, mine e regole extra',
    config: {
      rows: 12,
      columns: 12,
      mines: 20,
      safeStart: true,
      allowChord: true,
      allowQuestionMark: true
    }
  }
];

export const MIN_ROWS = 4;
export const MAX_ROWS = 30;
export const MIN_COLUMNS = 4;
export const MAX_COLUMNS = 30;
export const MIN_MINES = 1;
