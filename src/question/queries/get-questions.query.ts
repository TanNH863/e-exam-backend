export class GetQuestionsQuery {
  constructor(public readonly params: { examId?: string; pageNumber: number; pageSize: number }) {}
}