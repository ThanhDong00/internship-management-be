import { Module } from '@nestjs/common';
import { InternsInformationController } from './interns-information.controller';
import { InternsInformationService } from './interns-information.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternInformation } from './entities/intern-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternInformation])],
  controllers: [InternsInformationController],
  providers: [InternsInformationService],
  exports: [InternsInformationService],
})
export class InternsInformationModule {}
