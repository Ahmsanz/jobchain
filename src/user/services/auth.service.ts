import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      const { username, password } = credentials;
      const userInDb = await this.userService.findUserByEmail(username);

      if (!userInDb) throw new NotFoundException('user does not exist');

      if (userInDb.password !== password)
        throw new UnauthorizedException(
          'the provided credentials are wrong, please check the username or password',
        );

      const payload = {
        username,
        role: userInDb.role,
        auditedCompanies: userInDb.auditedCompanies,
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
