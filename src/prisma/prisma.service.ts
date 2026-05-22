import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl,
    });
    super({ adapter });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  async onModuleInit() {
    await this.$connect();
  }
}
