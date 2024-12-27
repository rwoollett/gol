import { Subjects } from './subjects';

export interface BoardByGenerationEvent {
  subject: Subjects.BoardByGeneration
  data: {
    genId: string;
    rows: number
    cols: number
    board: string[][]
  };
}


