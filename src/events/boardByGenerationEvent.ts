import { Subjects } from './subjects';

export interface BoardByGenerationEvent {
  subject: Subjects.BoardByGeneration
  data: {
    genId: number;
    rows: number
    cols: number
    board: number[][]
  };
}


