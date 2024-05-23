import { UserRole } from '../types/enums/role';

export class CreateUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  role: UserRole;
  auditedCompanies?: string[];
}
