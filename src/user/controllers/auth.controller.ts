import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, LoginRequest } from '../dtos';
import { AuthService } from '../services';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: LoginRequest): Promise<LoginDto> {
    const response = await this.authService.login(credentials);

    return response;
  }
}
