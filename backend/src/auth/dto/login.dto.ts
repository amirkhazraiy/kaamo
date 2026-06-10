import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: 'admin123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
