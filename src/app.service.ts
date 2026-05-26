import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const usersCount = await this.prisma.user.count();

    return {
      status: 'ok',
      app: 'nest-todo-jwt',
      database: 'connected',
      usersCount,
    };
  }
}
