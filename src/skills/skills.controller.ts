import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('skills')
@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiOperation({ summary: 'Create a new skill' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Post()
  async create(@Body() createSkillDto: CreateSkillDto, @User() user: any) {
    return await this.skillsService.create(createSkillDto, user.id);
  }

  @ApiOperation({ summary: 'Get all skills' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async findAll() {
    return await this.skillsService.findAll();
  }

  @ApiOperation({ summary: 'Get all skills for a user' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUserId(@User() user: any) {
    return await this.skillsService.findAllByUserId(user.id);
  }

  @ApiOperation({ summary: 'Get a skill by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: any) {
    const skill = await this.skillsService.findOne(id, user);
    if (!skill) {
      throw new NotFoundException(
        `Skill with ID ${id} not found or you do not have permission to view it`,
      );
    }
    return skill;
  }

  @ApiOperation({ summary: 'Update a skill by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @User() user: any,
  ) {
    const updatedSkill = await this.skillsService.update(
      id,
      updateSkillDto,
      user,
    );
    if (!updatedSkill) {
      throw new UnauthorizedException(
        `You are not the owner of this skill or the admin`,
      );
    }
    return updatedSkill;
  }

  @ApiOperation({ summary: 'Delete a skill by ID, not implemented' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
