import { Roles } from '@/shared';
import { RolesGuard } from '@/user/guards';
import {
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from '../services';
import { CheckPermissionDto, ResourceQuery } from '../types';
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
  @Get('audit/:resourceId')
  async getResourceById(@Param('resourceId') resourceId: string) {
    try {
      return this.resourceService.getResourceById(resourceId);
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Roles(['admin', 'auditor'])
  @Get('check')
  checkPermissionsOnCompany(
    @Query('company') company: string,
    @Req() req: RequestWithUser,
  ): CheckPermissionDto {
    try {
      const { user } = req;

      if (user.role === 'admin') {
        return {
          permission: 'granted',
          message:
            'issue a request to /audit to get the information from this company',
        };
      }

      if (!company) {
        return {
          permission: 'conditional',
          message: `you can audit resources from companies ${user.auditedCompanies}`,
        };
      }

      if (!user.auditedCompanies.includes(company)) {
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

  @Roles(['admin', 'auditor'])
  @Get('check/:resourceId')
  async checkPermissionsOnResource(
    @Param('resourceId') resourceId: string,
    @Req() req: RequestWithUser,
  ): Promise<CheckPermissionDto> {
    try {
      const { user } = req;

      if (user.role === 'admin') {
        return {
          permission: 'granted',
          message:
            'issue a request to /audit to get the information from this company',
        };
      }

      const { company } =
        await this.resourceService.getResourceById(resourceId);

      if (!user.auditedCompanies.includes(company)) {
        return {
          permission: 'rejected',
          message:
            'you are not allowed to request information from this company',
        };
      }

      return {
        permission: 'granted',
        message: 'issue a request to /audit/:resourceId to get the information',
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
