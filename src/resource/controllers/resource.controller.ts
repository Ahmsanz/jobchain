import { Roles } from '@/shared';
import { AuthGuard } from '@/user/guards';
import { RolesGuard } from '@/user/guards/roles.guard';
import {
  Controller,
  Get,
  HttpException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from '../services';
import { ResourceQuery } from '../types';

@UseGuards(RolesGuard)
@UseGuards(AuthGuard)
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
}
