import { UserModel, UserRole } from '@/user/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

interface RequestWithUser extends Request {
  user: UserModel;
}

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(
    req: RequestWithUser,
    res: Response,
    next: (error?: Error) => void,
  ) {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException(
          'You need permissions to reach this endpoint',
        );
      }
      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!req.query.company)
        throw new BadRequestException(
          'You must specify at least one company to check for this endpoint',
        );
      const queriedCompanies = (req.query.company as string).split(',');
      const auditedCompanies = user.auditedCompanies;

      if (user.role !== UserRole.admin) {
        for (const company of queriedCompanies) {
          if (!auditedCompanies.includes(company)) {
            throw new ForbiddenException(
              `You're not allowed to get information from company ${company}`,
            );
          }
        }
      }

      next();
    } catch (error) {
      Logger.error(error);
      if (error.message.includes('jwt expired'))
        throw new UnauthorizedException('token expired, please log in again');
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
