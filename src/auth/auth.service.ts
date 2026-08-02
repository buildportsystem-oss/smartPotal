import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 구글 reCAPTCHA 검증 메서드
  async verifyCaptcha(token: string): Promise<boolean> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey || secretKey === 'YOUR_RECAPTCHA_SECRET_KEY') {
      // 개발 환경이거나 키가 설정되지 않은 경우 일단 통과시킵니다.
      console.warn('reCAPTCHA 키가 설정되지 않아 검증을 건너뜁니다.');
      return true;
    }

    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
      );
      // 구글 API 응답에서 success가 true면 정상 토큰입니다.
      return response.data.success;
    } catch (error) {
      console.error('reCAPTCHA 검증 오류:', error);
      return false;
    }
  }

  // 로그인 메서드
  async login(loginDto: LoginDto) {
    const { loginId, password, captchaToken } = loginDto;

    // 1. 캡챠 토큰 검증
    if (captchaToken) {
      const isHuman = await this.verifyCaptcha(captchaToken);
      if (!isHuman) {
        throw new BadRequestException('자동화된 봇 공격이 의심됩니다. 캡챠를 다시 확인해주세요.');
      }
    }

    // 2. 로그인 아이디로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 잘못되었습니다.');
    }

    // 3. 비밀번호 확인 (bcrypt로 암호화된 비밀번호 비교)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 잘못되었습니다.');
    }

    // 4. JWT 토큰 발급 (로그인 성공 시)
    const payload = { sub: user.id, loginId: user.loginId, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // 로그인 결과 반환 (비밀번호는 제외)
    return {
      message: '로그인에 성공했습니다.',
      accessToken,
      user: {
        id: user.id,
        loginId: user.loginId,
        role: user.role,
      },
    };
  }

  // 관리자(테스트용) 계정 생성 메서드 (초보자용 테스트 지원)
  async createAdmin() {
    const existingAdmin = await this.prisma.user.findUnique({
      where: { loginId: 'admin' },
    });

    if (existingAdmin) {
      return { message: '이미 관리자 계정이 존재합니다.' };
    }

    // 비밀번호 암호화 (Salt Round: 10)
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const newAdmin = await this.prisma.user.create({
      data: {
        loginId: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return { message: '초기 관리자 계정이 생성되었습니다.', loginId: newAdmin.loginId };
  }
}
