import { RequestWithUser } from '@/shared/types';
import { UserRole } from '@/user/types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(
    req: RequestWithUser,
    res: Response,
    next: (error?: Error) => void,
  ) {
    try {
      if (!req.query.company)
        throw new BadRequestException(
          'You must specify at least one company to check for this endpoint',
        );
      const queriedCompanies = (req.query.company as string).split(',');
      const auditedCompanies = req.user.auditedCompanies;

      if (req.user.role !== UserRole.admin) {
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
}
