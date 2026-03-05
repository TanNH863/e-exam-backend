import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common';
import * as cookie from 'cookie';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method) || request.path === '/login') {
      return true;
    }

    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      throw new ForbiddenException('CSRF token missing');
    }

    const cookies = cookie.parse(cookieHeader);
    const csrfCookie = cookies['csrf_token'];
    const csrfHeader = request.headers['x-csrf-token'];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}