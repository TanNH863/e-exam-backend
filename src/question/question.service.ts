import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Question } from './interfaces/question.interface';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(createDto: CreateQuestionDto): Promise<Question> {
    const { exam_id, question_text, question_type, order } = createDto;
    const id = uuidv4();

    const query = `
      INSERT INTO questions (id, exam_id, question_text, question_type, "order")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await this.pool.query<Question>(query, [
        id,
        exam_id,
        question_text,
        question_type,
        order,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating question:', error);
      throw new InternalServerErrorException('Failed to create question');
    }
  }

  async findAll(examId: string): Promise<Question[]> {
    const query = `
      SELECT * FROM questions 
      WHERE exam_id = $1 
      ORDER BY "order" ASC
    `;

    try {
      const result = await this.pool.query<Question>(query, [examId]);
      return result.rows;
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
