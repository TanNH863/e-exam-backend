import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database.provider';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateQuestionsFromExamDto } from './dto/update-exam.dto';
import { Exam, Prisma } from '@prisma/client';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateExamDto): Promise<{ message: string; exam: Exam }> {
    const { title, description, start_time, duration_minutes, status, created_by_id } = createDto;

    try {
      const exam = await this.prisma.exam.create({
        data: {
          title,
          description: description ?? null,
          startTime: new Date(start_time),
          duration: duration_minutes,
          status,
          createdById: created_by_id,
        },
      });
      return { message: 'Exam created successfully', exam };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw new InternalServerErrorException('Failed to create exam');
    }
  }

  async findAll(): Promise<Exam[]> {
    try {
      return await this.prisma.exam.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            include: { question: { include: { options: true } } },
            orderBy: { order: 'asc' },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new InternalServerErrorException('Failed to fetch exams');
    }
  }

  async findOne(id: string): Promise<Exam> {
    try {
      const exam = await this.prisma.exam.findUnique({
        where: { id },
        include: {
          questions: {
            include: { question: { include: { options: true } } },
            orderBy: { order: 'asc' },
          },
          createdBy: true,
        },
      });

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      return exam;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching exam:', error);
      throw new InternalServerErrorException('Failed to fetch exam');
    }
  }

  async updateExamInfo(id: string, updateDto: UpdateExamDto): Promise<any> {
    try {
      const updateData: Prisma.ExamUpdateInput = {};

      if (updateDto.title !== undefined) {
        updateData.title = updateDto.title;
      }
      if (updateDto.description !== undefined) {
        updateData.description = updateDto.description;
      }
      if (updateDto.duration_minutes !== undefined) {
        updateData.duration = updateDto.duration_minutes;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No fields provided for update');
      }

      return await this.prisma.exam.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Exam not found');
      }
      if (error instanceof BadRequestException) throw error;
      
      console.error('Error updating exam:', error);
      throw new InternalServerErrorException('Failed to update exam');
    }
  }

  async updateQuestionListInExam(
    examId: string,
    dto: UpdateQuestionsFromExamDto
  ): Promise<{ message: string }> {
    try {
      // Verify exam exists
      const exam = await this.prisma.exam.findUnique({
        where: { id: examId },
      });

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      // Use Prisma transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete existing exam_questions mappings
        await tx.examQuestion.deleteMany({
          where: { examId },
        });

        // Verify all questions exist and create new mappings
        for (let i = 0; i < dto.question_ids.length; i++) {
          const questionId = dto.question_ids[i];

          const question = await tx.question.findUnique({
            where: { id: questionId },
          });

          if (!question) {
            throw new NotFoundException(
              `Question with id ${questionId} not found`
            );
          }

          await tx.examQuestion.create({
            data: {
              examId,
              questionId,
              order: i,
            },
          });
        }

        // Update exam status
        await tx.exam.update({
          where: { id: examId },
          data: { status: dto.status as any },
        });
      });

      return { message: 'Exam questions updated successfully' };
    } catch (error) {
      console.error('Error updating exam questions:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update exam questions');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const exam = await this.prisma.exam.delete({
        where: { id },
      });

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      return { message: 'Exam deleted successfully!' };
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw new InternalServerErrorException('Failed to delete exam');
    }
  }
}
