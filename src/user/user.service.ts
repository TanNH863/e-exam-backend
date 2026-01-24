import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  // Inject the PG Pool using a custom token 'PG_POOL'
  // We will set up this provider in the module
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, full_name, role } = createUserDto;

    // 1. Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. Generate new ID and timestamp
    const id = uuidv4();
    const created_at = new Date();

    // 3. Define the SQL query
    const query = `
      INSERT INTO users (id, email, password_hash, full_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [id, email, password_hash, full_name, role, created_at];

    try {
      // 4. Execute the query
      const result = await this.pool.query<User>(query, values);
      const newUser = result.rows[0];

      // 5. Return the new user
      // (Note: In a real app, you'd return a DTO that omits the password_hash)
      return newUser;
    } catch (error) {
      // Handle potential duplicate email error (PostgreSQL error code '23505')
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating the user.',
      );
    }
  }

  async findAll(): Promise<User[]> {
    const query = `SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC`;
    try {
      const result = await this.pool.query<User>(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<User> {
    const query = `SELECT id, email, full_name, role, created_at FROM users WHERE id = $1`;

    const result = await this.pool.query<User>(query, [id]);
    const user = result.rows[0];

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
