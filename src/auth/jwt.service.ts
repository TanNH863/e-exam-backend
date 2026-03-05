import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Try to get token from cookies first, then from Authorization header
    let token = request.cookies?.['access_token'];
    
    if (!token) {
      const authHeader = request.headers?.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const decoded = this.authService.verifyToken(token);
    
    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = decoded;
    return true;
  }
}
