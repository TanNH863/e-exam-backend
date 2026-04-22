import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database.provider';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string; user: User }> {
    const { email, password, full_name, role } = createUserDto;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const id = uuidv4();
    const created_at = new Date();

    try {
      const newUser = await this.prisma.user.create({
        data: {
          id,
          email,
          passwordHash: password_hash,
          fullName: full_name,
          role: UserRole[role as keyof typeof UserRole] || UserRole.STUDENT,
          createdAt: created_at,
        },
      });

      return { message: 'User created successfully', user: newUser };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('An error occurred while creating the user.');
    }
  }

  async bulkCreate(fileBuffer: Buffer | ArrayBuffer): Promise<{ message: string; }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const worksheet = workbook.getWorksheet('Users');
    
    try {
      worksheet?.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber === 1) return;
        const email = row.getCell(1).value?.toString() || '';
        const password = row.getCell(2).value?.toString() || '';
        const full_name = row.getCell(3).value?.toString() || '';
        const role = row.getCell(4).value?.toString() || '';

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        const created_at = new Date();
        
        // Insert user
        await this.prisma.user.create({
          data: {
            id: uuidv4(),
            email: email,
            passwordHash: password_hash,
            fullName: full_name,
            role: UserRole[role as keyof typeof UserRole] || UserRole.STUDENT,
            createdAt: created_at,
          },
        });
      })
        return { message: 'Bulk insert successful' };
    } catch (error) {
        console.error('Bulk insert error:', error);
        throw new InternalServerErrorException('Failed to bulk insert users');
    }
  }

  async findAll(): Promise<User[]> {
      try {
        return await this.prisma.user.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });
      } catch (error) {
          console.error('Error fetching users:', error);
          throw new InternalServerErrorException('Failed to fetch users');
      }
    }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return { message: 'User deleted successfully!' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
