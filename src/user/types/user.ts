import type { UserRole } from './enums/role';

export interface UserModel {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
  auditedCompanies?: string[];
}
