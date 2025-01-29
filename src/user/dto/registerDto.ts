import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name: string;
  @IsString()
  lastName: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  password: string;
  @IsBoolean()
  isVerified: boolean;
  @IsString()
  @IsIn(['admin', 'client'])
  role: string;
}

