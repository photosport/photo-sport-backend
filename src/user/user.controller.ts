import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';

import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/loginDto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('enable-auth-flow')
  async enableAuthFlow() {
    return this.userService.enableAuthFlow();
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.userService.login(email, password);
  }

  @Post('verification')
  async verificacionUser(@Body() body: { email: string; code: string }) {
    return this.userService.verificationUser(body.email, body.code);
  }

}
