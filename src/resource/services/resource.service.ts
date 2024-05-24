import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Resource } from '../schemas';
import { Model } from 'mongoose';
import { ResourceModel, ResourceQuery } from '../types';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<Resource>,
  ) {}

  async getResources(query?: ResourceQuery): Promise<ResourceModel[]> {
    try {
      const { company, limit, page } = query;

      const select: { [key: string]: string | { $in: string[] } } = {};

      if (company) select.company = { $in: company.split(',') };

      return this.resourceModel
        .find(select)
        .limit(limit)
        .skip(page ? (page - 1) * limit : 0);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async getResourceById(resourceId: string): Promise<ResourceModel> {
    try {
      return this.resourceModel.findById(resourceId);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
