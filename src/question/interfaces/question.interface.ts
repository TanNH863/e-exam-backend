export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE',
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options?: Option[];
}
