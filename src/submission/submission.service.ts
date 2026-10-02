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

  async execute(examId: string, dto: CreateSubmissionDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        startTime: true,
        duration: true,
      },
    });

    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    const now = new Date();
    const examEnd = new Date(exam.startTime);
    examEnd.setMinutes(examEnd.getMinutes() + exam.duration);

    if (now < exam.startTime || now > examEnd) {
      throw new BadRequestException('Exam is not active');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    return this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.examSubmission.findUnique({
          where: {
            examId_studentId: {
              examId,
              studentId: dto.studentId,
            },
          },
        });

        if (existing) {
          throw new ConflictException('Submission already exists for this student and exam');
        }

        const submissionId = uuidv4();

        const submission = await tx.examSubmission.create({
          data: {
            id: submissionId,
            examId,
            studentId: dto.studentId,
            status: dto.status ?? 1,
            startedAt: new Date(),
            completedAt: dto.complete ? new Date() : null,
          },
        });

        for (const answer of dto.answers) {
          const answerId = uuidv4();

          await tx.studentAnswer.create({
            data: {
              id: answerId,
              submissionId: submission.id,
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

        const score = await this.calculateScore(tx, dto.answers);

        await tx.examSubmission.update({
          where: { id: submission.id },
          data: { score },
        });

        return {
          id: submission.id,
          examId,
          studentId: dto.studentId,
          status: submission.status,
          score,
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