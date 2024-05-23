import type { UserModel } from './user';

export abstract class IUserRepository {
  abstract create?(user: UserModel): Promise<UserModel>;
  abstract readByEmail(email: string): Promise<UserModel>;
}
