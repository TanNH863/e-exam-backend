import { Question } from '../../question/interfaces/question.interface';

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  start_time: Date;
  duration_minutes: number;
  status: number;
  created_by_id: string;
  created_at: Date;
  questions?: Question[];
}
