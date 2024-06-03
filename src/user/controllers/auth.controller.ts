import { Body, Controller, HttpException, Logger, Post } from '@nestjs/common';
import { LoginDto, LoginRequest } from '../dtos';
import { AuthService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    type: LoginDto,
  })
  @Post('login')
  async login(@Body() credentials: LoginRequest): Promise<LoginDto> {
    try {
      const response = await this.authService.login(credentials);

      return response;
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
