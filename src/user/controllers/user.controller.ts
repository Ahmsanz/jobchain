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
import { CreateUserDto, CreateUserRequest, UserDto } from '../dtos';
import { UserService } from '../services';
import { RolesGuard } from '../guards';
import { Roles } from '@/shared/decorators';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: 201,
    type: CreateUserDto,
  })
  @Post()
  async createUser(@Body() user: CreateUserRequest) {
    try {
      return this.userService.createUser(user);
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @ApiBearerAuth('Bearer token')
  @ApiResponse({
    status: 200,
    type: UserDto,
  })
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
