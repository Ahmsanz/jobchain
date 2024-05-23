import { UserRole } from '../types';

export class UserDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  auditedCompanies?: string[];
}
