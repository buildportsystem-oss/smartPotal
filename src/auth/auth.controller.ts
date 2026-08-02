import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // API 경로: /api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인 API 엔드포인트
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 최초 관리자 계정 생성 (테스트용)
  @Post('init-admin')
  async initAdmin() {
    return this.authService.createAdmin();
  }
}
