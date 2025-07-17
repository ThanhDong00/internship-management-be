import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (user && (await bcrypt.compare(loginDto.password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Refresh token method
  async refreshToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Logout
  async logout() {
    // Có thể implement blacklist token ở đây
    return { message: 'Successfully logged out' };
  }
}
