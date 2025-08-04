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
import { SimpleUserDto } from 'src/users/dto/simple-user.dto';

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
    return await this.internsInformationService.findAll();
  }

  @ApiOperation({ summary: 'Get intern information for current intern user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('intern')
  @Get('interns')
  async findOneForIntern(@User() user: SimpleUserDto) {
    return await this.internsInformationService.findOneForIntern(user);
  }

  @ApiOperation({ summary: 'Get intern information by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Not sure
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.internsInformationService.findOne(id);
  }

  @ApiOperation({ summary: 'Update intern status by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return await this.internsInformationService.updateStatus(id, status);
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
    return await this.internsInformationService.updatePlan(id, planId, user);
  }

  @ApiOperation({ summary: 'Update intern mentor by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/mentor')
  async updateMentor(
    @Param('id') id: string,
    @Body('mentorId') mentorId: string,
  ) {
    return await this.internsInformationService.updateMentor(id, mentorId);
  }

  @ApiOperation({ summary: 'Update intern information by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateInternInformationDto,
  ) {
    return await this.internsInformationService.update(id, updateData);
  }
}
