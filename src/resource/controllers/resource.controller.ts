import { Roles } from '@/shared';
import { RolesGuard } from '@/user/guards';
import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Logger,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from '../services';
import { CheckPermissionDto, ResourceQuery } from '../types';
import { UserRole } from '@/user/types';
import { RequestWithUser } from '@/shared/types';

@UseGuards(RolesGuard)
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Roles(['admin'])
  @Get()
  async getAllResources(@Query() query: ResourceQuery) {
    try {
      return this.resourceService.getResources(query);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Roles(['admin', 'auditor'])
  @Get('audit')
  async getResourcesByCompany(@Query() query: ResourceQuery) {
    try {
      return this.resourceService.getResources(query);
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Roles(['admin', 'auditor'])
  @Get('check')
  checkPermissions(
    @Query('company') company: string,
    @Res({ passthrough: true }) req: RequestWithUser,
  ): CheckPermissionDto {
    try {
      if (!company) {
        throw new BadRequestException('You must specify a company to check');
      }

      const { user } = req;
      if (user.role !== UserRole.admin) {
        if (!user.auditedCompanies.includes(company))
          return {
            permission: 'rejected',
            message:
              'you are not allowed to request information from this company',
          };
      }

      return {
        permission: 'granted',
        message:
          'issue a request to /audit to get the information from this company',
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
