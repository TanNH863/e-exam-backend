export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  prefix: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: number;
  created_at: Date;
}
