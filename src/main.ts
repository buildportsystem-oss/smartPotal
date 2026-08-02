import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestJS 애플리케이션 생성
  const app = await NestFactory.create(AppModule);
  
  // API의 기본 경로를 /api/v1 으로 설정합니다.
  app.setGlobalPrefix('api/v1');

  // 외부(프론트엔드 등)에서 접근할 수 있도록 CORS 활성화
  // 보안을 위해 로컬 개발 환경과 Vercel에 배포된 실제 사이트 주소만 허용합니다.
  app.enableCors({
    origin: [
      'http://localhost:5173', // 로컬 개발용 React 주소
      'https://smart-potal-a798.vercel.app', // 실제 배포된 Vercel 주소
    ],
    credentials: true,
  });
  // 3000번 포트에서 서버 실행
  await app.listen(3000);
  console.log(`서버가 성공적으로 실행되었습니다: http://localhost:3000/api/v1`);
}

bootstrap();
