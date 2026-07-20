import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database.provider';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string; user: User }> {
    const { id, prefix, email, password, full_name } = createUserDto;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const created_at = new Date();

    try {
      const newUser = await this.prisma.user.create({
        data: {
          id,
          prefix,
          email,
          passwordHash: password_hash,
          fullName: full_name,
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
        const id = row.getCell(1).value?.toString() || '';
        const prefix = row.getCell(2).value?.toString() || '';
        const email = row.getCell(3).value?.toString() || '';
        const password = row.getCell(4).value?.toString() || '';
        const full_name = row.getCell(5).value?.toString() || '';

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        const created_at = new Date();
        
        // Insert user
        await this.prisma.user.create({
          data: {
            id: id,
            prefix: prefix,
            email: email,
            passwordHash: password_hash,
            fullName: full_name,
            createdAt: created_at,
          },
        });

        // Insert role-specific record
        if (prefix === 'TC') {
          await this.prisma.teacher.upsert({
            where: { id: id },
            update: {},
            create: { id: id },
          });
        }
        if (prefix === 'AD') {
          await this.prisma.admin.upsert({
            where: { id: id },
            update: {},
            create: { id: id },
          });
        }
        if (prefix === 'ST') {
          await this.prisma.student.upsert({
            where: { id: id },
            update: {},
            create: { id: id },
          });
        }
      })
        return { message: 'Bulk insert successful' };
    } catch (error) {
        console.error('Bulk insert error:', error);
        throw new InternalServerErrorException('Failed to bulk insert users');
    }
  }

  // async findAll(): Promise<User[]> {
  //   try {
  //     return await this.prisma.user.findMany({
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     });
  //   } catch (error) {
  //       console.error('Error fetching users:', error);
  //       throw new InternalServerErrorException('Failed to fetch users');
  //   }
  // }

  async findAll(pageNumber: number, pageSize: number): Promise<User[]> {
    try {
      // first page -> page 0
      // first page: pageNumber = 1 -> skip: 0 * pageSize = 0
      // second page: pageNumber = 2 -> skip: 1 * pageSize = pageSize
      return await this.prisma.user.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
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
      await this.prisma.user.delete({ where: { id } });
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
