export class StartExamCommand {
	constructor(
		public readonly examId: string,
		public readonly studentId: string,
	) {}
}