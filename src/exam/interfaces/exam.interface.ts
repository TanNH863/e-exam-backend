export interface Exam {
  id: string;
  title: string;
  description: string | null;
  start_time: Date;
  duration_minutes: number;
  status: ExamStatus;
  created_by_id: string;
  created_at: Date;
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
}
