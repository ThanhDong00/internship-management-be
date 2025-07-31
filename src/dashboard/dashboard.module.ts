import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { InternInformation } from 'src/interns-information/entities/intern-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, InternInformation])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
