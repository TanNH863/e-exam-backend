import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateQuestionsFromExamDto } from './dto/update-exam.dto';
import { Exam } from './interfaces/exam.interface';
import { Question } from '../question/interfaces/question.interface';

@Injectable()
export class ExamService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(
    createDto: CreateExamDto,
  ): Promise<{ message: string; exam: Exam }> {
    const {
      title,
      description,
      start_time,
      duration_minutes,
      status,
      created_by_id,
    } = createDto;
    const query = `
      INSERT INTO exams (title, description, start_time, duration_minutes, status, created_by_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    try {
      const result = await this.pool.query<Exam>(query, [
        title,
        description ?? null,
        start_time,
        duration_minutes,
        status,
        created_by_id,
      ]);
      return { message: 'Exam created successfully', exam: result.rows[0] };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw new InternalServerErrorException('Failed to create exam');
    }
  }

  async findAll(): Promise<Exam[]> {
    const query = `SELECT * FROM exams ORDER BY created_at DESC`;
    try {
      const result = await this.pool.query<Exam>(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new InternalServerErrorException('Failed to fetch exams');
    }
  }

  async findOne(id: string): Promise<Exam> {
    const examQuery = `SELECT * FROM exams WHERE id = $1`;
    const examResult = await this.pool.query<Exam>(examQuery, [id]);
    const exam = examResult.rows[0];
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const questionsQuery = `
      SELECT q.* FROM questions q
      JOIN exam_questions eq ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY eq."order" ASC
    `;

    try {
      const qResult = await this.pool.query<Question>(questionsQuery, [id]);
      exam.questions = qResult.rows;
    } catch (error) {
      console.error('Error fetching questions for exam:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }

    return exam;
  }

  async updateExamInfo(id: string, updateDto: UpdateExamDto): Promise<Exam> {
    // Build dynamic SET clause
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (updateDto.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(updateDto.title);
    }
    if (updateDto.description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(updateDto.description);
    }
    if (updateDto.duration_minutes !== undefined) {
      sets.push(`duration_minutes = $${idx++}`);
      values.push(updateDto.duration_minutes);
    }
    if (sets.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }
    const query = `UPDATE exams SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);
    try {
      const result = await this.pool.query<Exam>(query, values);
      const updated = result.rows[0];
      if (!updated) throw new NotFoundException('Exam not found');
      return updated;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw new InternalServerErrorException('Failed to update exam');
    }
  }

  async updateQuestionListInExam(
    examId: string,
    dto: UpdateQuestionsFromExamDto
  ): Promise<{ message: string }> {
    try {
      // Start a transaction
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // Verify exam exists
        const examResult = await client.query('SELECT id FROM exams WHERE id = $1', [examId]);
        if (examResult.rows.length === 0) {
          throw new NotFoundException('Exam not found');
        }

        // Delete existing exam_questions mappings
        await client.query('DELETE FROM exam_questions WHERE exam_id = $1', [examId]);

        // Insert new exam_questions mappings with order
        for (let i = 0; i < dto.question_ids.length; i++) {
          const questionId = dto.question_ids[i];
          // Verify question exists
          const questionResult = await client.query(
            'SELECT id FROM questions WHERE id = $1',
            [questionId],
          );
          if (questionResult.rows.length === 0) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
          }

          await client.query(
            `INSERT INTO exam_questions (exam_id, question_id, "order")
             VALUES ($1, $2, $3)`,
            [examId, questionId, i],
          );
        }

        await client.query('COMMIT');
        await client.query(`UPDATE exams SET status = $1 WHERE id = $2`, [dto.status, examId]);
        return { message: 'Exam questions updated successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating exam questions:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update exam questions');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const query = `DELETE FROM exams WHERE id = $1 RETURNING id`;
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new NotFoundException('Exam not found');
      }
      return { message: 'Exam deleted successfully!' };
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw new InternalServerErrorException('Failed to delete exam');
    }
  }
}
