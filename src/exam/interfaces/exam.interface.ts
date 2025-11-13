export interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  created_by_id: string;
  created_at: Date;
}
