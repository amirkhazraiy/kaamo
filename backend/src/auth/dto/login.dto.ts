import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, example: 'YOUR_ADMIN_EMAIL_HERE' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: 'YOUR_STRONG_ADMIN_PASSWORD_HERE', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
