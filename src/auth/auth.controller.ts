import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Logs in a user and returns a JWT token',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        value: {
          username: 'admin1',
          password: '123456',
        },
      },
      mentor: {
        value: {
          username: 'mentor1',
          password: '123456',
        },
      },
      intern: {
        value: {
          username: 'intern1',
          password: '123456',
        },
      },
    },
  })
  async login(@Body() data: LoginDto) {
    const user = await this.authService.validateUser(data);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return this.authService.logout();
  }
}
