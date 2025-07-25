import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InternsInformationModule } from './interns-information/interns-information.module';
import { TasksModule } from './tasks/tasks.module';
import { TrainingPlansModule } from './training-plans/training-plans.module';
import { AssignmentsModule } from './assignments/assignments.module';
import 'dotenv/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    SkillsModule,
    UsersModule,
    AuthModule,
    InternsInformationModule,
    TasksModule,
    TrainingPlansModule,
    AssignmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
