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
import { CheckPermissionDto, ResourceQuery, ResourceModel } from '../types';
import { RequestWithUser } from '@/shared/types';
import {
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('resources')
@UseGuards(RolesGuard)
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @ApiQuery({
    name: 'company',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        company: {
          type: 'string',
        },
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              employees: {
                type: 'number',
              },
              budget: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  })
  @Roles(['admin'])
  @Get()
  async getAllResources(@Query() query: ResourceQuery) {
    try {
      return this.resourceService.getResources(query);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @ApiQuery({
    name: 'company',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        company: {
          type: 'string',
        },
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              employees: {
                type: 'number',
              },
              budget: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  })
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

  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        company: {
          type: 'string',
        },
        info: {
          type: 'object',
          properties: {
            employees: {
              type: 'number',
            },
            budget: {
              type: 'number',
            },
          },
        },
      },
    },
  })
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

  @ApiParam({
    type: 'string',
    name: 'company',
    required: false,
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        permission: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
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

  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        permission: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
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
