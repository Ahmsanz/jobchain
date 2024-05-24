import { UserModel, UserRole } from '@/user/types';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: UserModel;
}
