import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import type { Model } from 'mongoose';
import { CreateUserRequest } from '../dtos/create-user.request';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserDto } from '../dtos/user.dto';
import { UserModel } from '../types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(user: CreateUserRequest): Promise<CreateUserDto> {
    try {
      const userToSave = new this.userModel(user);

      const { password, _id, ...savedUser } = (
        await userToSave.save()
      ).toJSON();

      return savedUser;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserModel> {
    try {
      const { _id, ...userInDb } = (
        await this.userModel.findOne({ email }, { __v: 0 })
      ).toJSON();

      return userInDb;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
