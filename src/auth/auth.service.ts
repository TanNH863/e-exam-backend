import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database.provider';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import dotenv from "dotenv";

dotenv.config();

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...userInfo } = user;
      return userInfo;
    }
    return null;
  }

  signToken(payload: object, expiresIn = '1h'): string {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }
}
