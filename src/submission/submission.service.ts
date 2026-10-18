import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database.provider';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async start(examId: string, studentId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        startTime: true,
        duration: true
      },
    });

    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const now = new Date();
    if (now < exam.startTime) {
      throw new BadRequestException('Exam is not yet available');
    }

    // Check if the student already started this exam
    const existingAttempt = await this.prisma.examSubmission.findUnique({
      where: {
        examId_studentId: { examId, studentId },
      },
    });

    if (existingAttempt) {
      throw new ConflictException('Exam already started by this student');
    }

    // Calculate the strict deadline for specific student
    const endsAt = new Date(now.getTime() + exam.duration * 60000);

    const submission = await this.prisma.examSubmission.create({
      data: {
        id: uuidv4(),
        examId,
        studentId,
        status: 1,
        startedAt: now,
        endsAt: endsAt,
      },
    });

    return {
      id: submission.id,
      examId,
      studentId,
      startedAt: submission.startedAt,
      endsAt: submission.endsAt,
    };
  }

  async create(examId: string, dto: CreateSubmissionDto) {
    const now = new Date();

    const activeSubmission = await this.prisma.examSubmission.findUnique({
      where: {
        examId_studentId: { examId, studentId: dto.studentId },
      },
    });

    if (!activeSubmission) {
      throw new BadRequestException('Exam attempt not started. You must start the exam first.');
    }

    if (activeSubmission.completedAt) {
      throw new ConflictException('This exam has already been submitted.');
    }

    // 2. Enforce the strict timer deadline
    // Adding a minor grace period (e.g., 5 seconds) is common for network latency
    const gracePeriodMs = 5000; 
    if (now.getTime() > activeSubmission.endsAt.getTime() + gracePeriodMs) {
      throw new BadRequestException('Exam time has expired. Submission rejected.');
    }

    return this.prisma
      .$transaction(async (tx) => {
        // 3. Insert student answers
        for (const answer of dto.answers) {
          const answerId = uuidv4();
          await tx.studentAnswer.create({
            data: {
              id: answerId,
              submissionId: activeSubmission.id,
              questionId: answer.questionId,
              chosenOptionId: answer.chosenOptionId ?? null,
              shortAnswerText: answer.shortAnswerText ?? null,
            },
          });

          if (answer.chosenOptionIds?.length) {
            await tx.studentMultiAnswer.createMany({
              data: answer.chosenOptionIds.map((optionId) => ({
                studentAnswerId: answerId,
                chosenOptionId: optionId,
              })),
            });
          }
        }

        // 4. Calculate score
        const score = await this.calculateScore(tx, dto.answers);

        // 5. Update submission state
        const finalStatus = dto.status ?? 2; // 2 = Submitted

        await tx.examSubmission.update({
          where: { id: activeSubmission.id },
          data: { 
            score,
            status: finalStatus,
            completedAt: now 
          },
        });

        return {
          id: activeSubmission.id,
          examId,
          studentId: dto.studentId,
          status: finalStatus,
          score,
          completedAt: now
        };
      })
      .catch((err) => {
        if (err instanceof ConflictException || err instanceof BadRequestException) {
          throw err;
        }
        throw new InternalServerErrorException(err.message);
      });
  }

  private async calculateScore(tx: any, answers: any[]) {
    const questionIds = answers.map((answer) => answer.questionId);
    if (!questionIds.length) return 0;

    const options = await tx.option.findMany({
      where: {
        questionId: { in: questionIds },
      },
      select: {
        id: true,
        questionId: true,
        isCorrect: true,
      },
    });

    const optionMap = new Map<string, any[]>();
    for (const option of options) {
      const list = optionMap.get(option.questionId) ?? [];
      list.push(option);
      optionMap.set(option.questionId, list);
    }

    let correct = 0;
    let scorable = 0;

    for (const answer of answers) {
      const questionOptions = optionMap.get(answer.questionId) ?? [];

      if (answer.chosenOptionIds?.length) {
        scorable++;
        const correctIds = questionOptions
          .filter((option) => option.isCorrect)
          .map((option) => option.id);
          
        const chosen = new Set(answer.chosenOptionIds);
        const expected = new Set(correctIds);

        if (
          chosen.size === expected.size &&
          [...chosen].every((id) => expected.has(id))
        ) {
          correct++;
        }
      } else if (answer.chosenOptionId) {
        scorable++;
        const selectedOption = questionOptions.find(
          (option) => option.id === answer.chosenOptionId,
        );
        if (selectedOption?.isCorrect) {
          correct++;
        }
      }
    }

    const total = scorable || 1;
    return Number(((correct / total) * 100).toFixed(2));
  }
}