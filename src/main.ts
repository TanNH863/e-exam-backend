import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CsrfGuard } from './auth/csrf.guard';
import * as cookie from 'cookie';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    if (req.headers.cookie) {
      req.cookies = cookie.parse(req.headers.cookie);
    } else {
      req.cookies = {};
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(new CsrfGuard());
  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
}
bootstrap();
