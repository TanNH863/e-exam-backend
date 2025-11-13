import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

const JWT_SECRET =
  '07eca1c31cfa39375fc3f130442d4d7c816d14bafc5b683feb73df0e2d7eb06e';

@Injectable()
export class AuthService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async validateUser(email: string, password: string) {
    const query = `
      SELECT id, email, password_hash, full_name, role 
      FROM users 
      WHERE email = $1
    `;

    const result = await this.pool.query(query, [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...userInfo } = user;
      return userInfo;
    }
    return null;
  }

  signToken(payload: object, expiresIn = '1h'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
}
