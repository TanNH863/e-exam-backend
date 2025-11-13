export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  order: number;
}
