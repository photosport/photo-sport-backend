import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class PasswordDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  password: string;
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  verPassword: string;
}