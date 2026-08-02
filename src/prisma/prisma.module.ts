import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global 데코레이터를 사용하여 어디서든 PrismaService를 사용할 수 있도록 합니다.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 다른 모듈에서 사용할 수 있도록 export
})
export class PrismaModule {}
