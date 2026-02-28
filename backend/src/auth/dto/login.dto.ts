import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  username: string; // OAuth2 form field is "username" — we treat it as email

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
