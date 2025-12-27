import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { ExamService } from './exam/exam.service';
import { ExamModule } from './exam/exam.module';
import { DatabaseModule } from './database.module';
import { QuestionService } from './question/question.service';
import { QuestionController } from './question/question.controller';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    ExamModule,
    QuestionModule,
  ],
  controllers: [AppController, UserController, QuestionController],
  providers: [
    AppService,
    AuthService,
    UserService,
    ExamService,
    QuestionService,
  ],
})
export class AppModule {}
