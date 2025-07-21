import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InternsInformationService } from './interns-information.service';
import { UpdateInternInformationDto } from './dto/update-intern-information.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('interns-information')
@ApiBearerAuth()
@Controller('interns-information')
export class InternsInformationController {
  constructor(
    private readonly internsInformationService: InternsInformationService,
  ) {}

  @ApiOperation({ summary: 'Get all interns information' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    try {
      return await this.internsInformationService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching intern information: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Get intern information by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Not sure
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const internInfo = await this.internsInformationService.findOne(id);
      if (!internInfo) {
        throw new NotFoundException('Intern information not found');
      }
      return internInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching intern information: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Update intern status by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      return await this.internsInformationService.updateStatus(id, status);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern status: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Update intern training plan by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id/plan')
  async updatePlan(
    @Param('id') id: string,
    @Body('planId') planId: string,
    @User() user: any,
  ) {
    try {
      const updatedInternInfo = await this.internsInformationService.updatePlan(
        id,
        planId,
        user,
      );

      if (!updatedInternInfo) {
        throw new ForbiddenException(
          'You do not have permission to update this intern information',
        );
      }

      return updatedInternInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern plan: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Update intern mentor by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/mentor')
  async updateMentor(
    @Param('id') id: string,
    @Body('mentorId') mentorId: string,
  ) {
    try {
      return await this.internsInformationService.updateMentor(id, mentorId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern mentor: ' + error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Update intern information by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateInternInformationDto,
  ) {
    try {
      return await this.internsInformationService.update(id, updateData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error updating intern information: ' + error.message,
      );
    }
  }
}
