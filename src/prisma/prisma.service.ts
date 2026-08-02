import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // 모듈이 초기화될 때 데이터베이스 연결
  async onModuleInit() {
    await this.$connect();
  }

  // 모듈이 파괴될 때 데이터베이스 연결 해제
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
