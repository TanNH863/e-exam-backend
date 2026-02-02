import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Pool } from 'pg';
import { Question } from './interfaces/question.interface';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(
    createDto: CreateQuestionDto,
  ): Promise<{ message: string; question: Question }> {
    const { question_text, question_type, options } = createDto;
    const id = uuidv4();

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const insertQ = `
        INSERT INTO questions (id, question_text, question_type)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const qResult = await client.query<Question>(insertQ, [
        id,
        question_text,
        question_type,
      ]);

      const createdQuestion = qResult.rows[0];
      const questionId = createdQuestion.id || id;

      let insertedOptions: any[] = [];

      if (options && Array.isArray(options) && options.length > 0) {
        const insertOption = `
          INSERT INTO options (id, question_id, option_text, is_correct)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;

        for (const opt of options) {
          const optId = uuidv4();
          const oRes = await client.query(insertOption, [
            optId,
            questionId,
            opt.option_text,
            !!opt.is_correct,
          ]);
          insertedOptions.push(oRes.rows[0]);
        }
      }

      await client.query('COMMIT');

      // Attach options if any and return
      return {
        message: 'Question created successfully',
        question: {
          ...createdQuestion,
          options: insertedOptions.length ? insertedOptions : undefined,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating question:', error);
      throw new InternalServerErrorException('Failed to create question');
    } finally {
      client.release();
    }
  }

  async bulkCreate(fileBuffer: Buffer | ArrayBuffer): Promise<{ message: string; }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const worksheet = workbook.worksheets[0];

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

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
        const qRes = await client.query(
          `INSERT INTO questions (id, question_text, question_type)
           VALUES ($1, $2, $3) RETURNING *`,
          [questionId, question_text, question_type],
        );

        // Insert options
        const options = [
          { text: optionA, isCorrect: correctAnswer === 'A' },
          { text: optionB, isCorrect: correctAnswer === 'B' },
          { text: optionC, isCorrect: correctAnswer === 'C' },
          { text: optionD, isCorrect: correctAnswer === 'D' },
        ];

        for (const opt of options) {
          if (opt.text) {
            await client.query(
              `INSERT INTO options (id, question_id, option_text, is_correct)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), questionId, opt.text, opt.isCorrect],
            );
          }
        }

      });

      await client.query('COMMIT');
      return { message: 'Bulk insert successful' };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Bulk insert error:', error);
      throw new InternalServerErrorException('Failed to bulk insert questions');
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Question[]> {
    const query = `SELECT * FROM questions`;

    try {
      const result = await this.pool.query<Question>(query);
      const questions = result.rows;
      // Attach options for each question
      for (const q of questions) {
        const oRes = await this.pool.query(
          `SELECT * FROM options WHERE question_id = $1`,
          [q.id],
        );
        if (oRes?.rows?.length) q.options = oRes.rows;
      }
      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }
  }

  async findAllByExam(examId: string): Promise<Question[]> {
    const query = `
      SELECT q.*, eq.order 
      FROM questions q
      JOIN exam_questions eq ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq.order ASC;
    `;

    try {
      const result = await this.pool.query<Question>(query, [examId]);
      const questions = result.rows;

      // Attach options for each question
      for (const q of questions) {
        const oRes = await this.pool.query(
          `SELECT * FROM options WHERE question_id = $1`,
          [q.id],
        );
        if (oRes?.rows?.length) q.options = oRes.rows;
      }

      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }
  }

  async findOne(id: string): Promise<Question> {
    const query = `SELECT * FROM questions WHERE id = $1`;

    const result = await this.pool.query<Question>(query, [id]);
    const question = result.rows[0];

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const oRes = await this.pool.query(
      `SELECT * FROM options WHERE question_id = $1`,
      [id],
    );
    if (oRes?.rows?.length) question.options = oRes.rows;

    return question;
  }

  async update(id: string, updateDto: UpdateQuestionDto): Promise<Question> {
    const updates: string[] = [];
    const values: string[] = [];
    let paramCount = 1;

    Object.entries(updateDto).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return this.findOne(id);
    }

    values.push(id);
    const query = `
      UPDATE questions 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await this.pool.query<Question>(query, values);
      if (!result.rows[0]) {
        throw new NotFoundException('Question not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error updating question:', error);
      throw new InternalServerErrorException('Failed to update question');
    }
  }

  async remove(id: string): Promise<void> {
    const query = `DELETE FROM questions WHERE id = $1 RETURNING id`;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new NotFoundException('Question not found');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new InternalServerErrorException('Failed to delete question');
    }
  }
}
