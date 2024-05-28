import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types';

export class UserDto {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  auditedCompanies?: string[];
}
