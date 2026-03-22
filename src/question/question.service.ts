import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Question, QuestionType } from '@prisma/client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database.provider';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateQuestionDto): Promise<{ message: string; question: Question }> {
    const { question_text, question_type, options } = createDto;
    const id = uuidv4();

    try {
      const question = await this.prisma.question.create({
        data: {
          id,
          questionText: question_text,
          questionType: question_type,
          options: options
            ? {
                create: options.map((opt) => ({
                  optionText: opt.option_text,
                  isCorrect: !!opt.is_correct,
                })),
              }
            : undefined,
        },
        include: { options: true },
      });

      return { message: 'Question created successfully', question };
    } catch (error) {
      console.error('Error creating question:', error);
      throw new InternalServerErrorException('Failed to create question');
    }
  }

  async bulkCreate(fileBuffer: Buffer | ArrayBuffer): Promise<{ message: string; }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const worksheet = workbook.worksheets[0];
    try {
      worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber === 1) return;
        const question_text = row.getCell(1).value?.toString() || '';
        const question_type = row.getCell(2).value?.toString() || '';
        const optionA = row.getCell(3).value?.toString() || '';
        const optionB = row.getCell(4).value?.toString() || '';
        const optionC = row.getCell(5).value?.toString() || '';
        const optionD = row.getCell(6).value?.toString() || '';
        const correctAnswer = row.getCell(7).value?.toString() || '';
        const questionId = uuidv4();

        // Insert question
        const qRes = await this.prisma.question.create({
          data: {
            id: questionId,
            questionText: question_text,
            questionType: QuestionType[question_type as keyof typeof QuestionType] || QuestionType.MULTIPLE_CHOICE,
          },
        });

        // Insert options
        const options = [
          { text: optionA, isCorrect: correctAnswer === 'A' },
          { text: optionB, isCorrect: correctAnswer === 'B' },
          { text: optionC, isCorrect: correctAnswer === 'C' },
          { text: optionD, isCorrect: correctAnswer === 'D' },
        ];
        options.map(async (opt) => {
          if (opt.text) {
            await this.prisma.option.create({
              data: {
                id: uuidv4(),
                questionId: questionId,
                optionText: opt.text,
                isCorrect: opt.isCorrect,
              },
            });
          }
        });
      })
        return { message: 'Bulk insert successful' };
    } catch (error) {
        console.error('Bulk insert error:', error);
        throw new InternalServerErrorException('Failed to bulk insert questions');
    }
  }

  async findAll(): Promise<Question[]> {
    try {
      return await this.prisma.question.findMany({
        include: { options: true },
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }
  }

  async findAllByExam(examId: string): Promise<Question[]> {
    try {
      const questions = await this.prisma.question.findMany({
        where: {
          examQuestions: {
            some: {
              examId: examId,
            },
          },
        },
        include: {
          options: true,
        },
      });
      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }
  }

  async findOne(id: string): Promise<Question> {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: { options: true },
      });
      if (!question) {
        throw new NotFoundException('Question not found');
      }
      return question;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching question:', error);
      throw new InternalServerErrorException('Failed to fetch question');
    }
  }

  async update(id: string, updateDto: UpdateQuestionDto): Promise<Question> {
    try {
      const updatedQuestion = await this.prisma.question.update({
        where: { id },
        data: updateDto,
      });
      return updatedQuestion;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new InternalServerErrorException('Failed to update question');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.question.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new InternalServerErrorException('Failed to delete question');
    }
  }
}
