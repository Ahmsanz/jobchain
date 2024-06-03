import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  token: string;

  @ApiProperty({
    type: Number,
  })
  expiration: Date | number;
}
