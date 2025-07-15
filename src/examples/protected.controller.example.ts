// Ví dụ sử dụng trong protected routes
import { 
  Controller, 
  Get, 
  UseGuards, 
  Post, 
  Body 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('protected')
export class ProtectedController {
  
  // Route chỉ cho user đã login
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: any) {
    return { message: 'This is your profile', user };
  }

  // Route chỉ cho admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  adminOnly() {
    return { message: 'Admin only route' };
  }

  // Route cho admin và mentor
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'mentor')
  @Get('admin-mentor')
  adminMentor() {
    return { message: 'Admin and Mentor route' };
  }
}
