import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // JWT 토큰 생성을 위한 설정
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'b2g_super_secret_key_123',
      signOptions: { expiresIn: '1d' }, // 1일 후 만료
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
