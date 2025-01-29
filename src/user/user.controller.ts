import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';

import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/loginDto';
import { EmailDto } from './dto/emailDto';
import { PasswordDto } from './dto/passwordDto';
import { UserService } from './user.service';
import { AuthGuard } from './guard/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('email')
  email(@Body() email: EmailDto) {
    return this.userService.email(email);
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  password(@Request() req, @Body() passDto: PasswordDto) {
    return this.userService.password(req.user.email, passDto);
  }

  @Patch('tokens')
  @UseGuards(AuthGuard)
  token(@Request() req, @Body() isVerified: boolean) {
    return this.userService.token(req.user.email, isVerified);
  }

}
