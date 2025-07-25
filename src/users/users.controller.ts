import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      admin: {
        value: {
          email: 'admin1@example.com',
          username: 'admin1',
          password: '123456',
          fullName: 'Admin1',
          role: 'admin',
        },
      },
      intern: {
        value: {
          email: 'intern1@example.com',
          username: 'intern1',
          password: '123456',
          fullName: 'Intern1',
          role: 'intern',
          internInformation: {
            field: 'Software Engineering',
            startDate: '2025-07-14',
            endDate: '2025-08-14',
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Get all users',
    description:
      'Get all users. Use ?role=admin|mentor|intern to filter by role',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['admin', 'mentor', 'intern'],
    description: 'Filter users by role',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll(query.role);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@User() user: any) {
    return this.usersService.findOne(user.id);
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      all: {
        value: {
          fullName: 'Updated User Name',
          phoneNumber: '1234567890',
          address: '123 Updated Street',
          dob: '1990-01-01',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@User() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      admin: {
        value: {
          fullName: 'Updated Admin Name',
        },
      },
      intern: {
        value: {
          fullName: 'Updated Intern Name',
          internInformation: {
            field: 'Updated Field',
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
