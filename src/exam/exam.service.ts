import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './interfaces/exam.interface';

@Injectable()
export class ExamService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(
    createDto: CreateExamDto,
  ): Promise<{ message: string; exam: Exam }> {
    const { title, description, duration_minutes, created_by_id } = createDto;
    const query = `
      INSERT INTO exams (title, description, duration_minutes, created_by_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    try {
      const result = await this.pool.query<Exam>(query, [
        title,
        description ?? null,
        duration_minutes,
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
    const query = `SELECT * FROM exams WHERE id = $1`;
    const result = await this.pool.query<Exam>(query, [id]);
    const exam = result.rows[0];
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  async update(id: string, updateDto: UpdateExamDto): Promise<Exam> {
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
