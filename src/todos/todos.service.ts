import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: AuthenticatedUser, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId: currentUser.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'ToDo criado com sucesso',
      todo,
    };
  }
  async findAll(currentUser: AuthenticatedUser) {
    const todos = await this.prisma.todo.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      todos,
      total: todos.length,
    };
  }
}
