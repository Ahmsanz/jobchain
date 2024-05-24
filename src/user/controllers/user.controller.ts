import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserRequest } from '../dtos';
import { UserService } from '../services';
import { RolesGuard } from '../guards';
import { Roles } from '@/shared/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: CreateUserRequest) {
    try {
      return this.userService.createUser(user);
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Get('/:email')
  async getUserByEmail(@Param('email') email: string) {
    try {
      const { password, ...user } =
        await this.userService.findUserByEmail(email);

      return user;
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
