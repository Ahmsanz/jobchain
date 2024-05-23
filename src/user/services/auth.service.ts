import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { LoginRequest } from '../dtos/login.request';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(credentials: LoginRequest): Promise<LoginDto> {
    try {
      const { username } = credentials;
      const userInDb = await this.userService.findUserByEmail(username);

      if (!userInDb) throw new NotFoundException('user does not exist');

      const payload = {
        username,
        role: userInDb.role,
        companies: userInDb.auditedCompanies,
      };

      return {
        username,
        token: await this.jwtService.signAsync(payload),
        expiration: null,
      };
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
