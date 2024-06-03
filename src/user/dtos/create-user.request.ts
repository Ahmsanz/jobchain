import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/enums/role';

export class CreateUserRequest {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty()
  auditedCompanies?: string[];
}
