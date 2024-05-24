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
import { Response } from 'express';
import { ResourceService } from '../services';

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(private readonly resourceService: ResourceService) {}

  async use(
    req: RequestWithUser,
    res: Response,
    next: (error?: Error) => void,
  ) {
    try {
      if (req.params.resourceId) {
        const resource = await this.resourceService.getResourceById(
          req.params.resourceId,
        );
        if (!req.user.auditedCompanies.includes(resource.company)) {
          throw new ForbiddenException(
            `You are not allowed to get this resource, since you are not an auditor for company ${resource.company}`,
          );
        }
      } else {
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
