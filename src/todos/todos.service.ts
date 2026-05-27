import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import type { TodoSortField, TodoSortOrder } from './dto/find-todos-query.dto';
import { FindTodosQueryDto } from './dto/find-todos-query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Prisma } from '../generated/prisma/client';

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
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      message: 'ToDo criado com sucesso',
      todo,
    };
  }

  async findAll(currentUser: AuthenticatedUser, query: FindTodosQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TodoWhereInput = {
      userId: currentUser.id,
    };

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
          },
        },
        {
          description: {
            contains: query.search,
          },
        },
      ];
    }

    const orderBy = this.buildOrderBy(query.sortBy, query.order);

    const [total, todos] = await this.prisma.$transaction([
      this.prisma.todo.count({
        where,
      }),
      this.prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      todos,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(currentUser: AuthenticatedUser, todoId: string) {
    const todo = await this.prisma.todo.findFirst({
      where: {
        id: todoId,
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
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!todo) {
      throw new NotFoundException('ToDo não encontrado');
    }

    return {
      todo,
    };
  }

  async update(
    currentUser: AuthenticatedUser,
    todoId: string,
    dto: UpdateTodoDto,
  ) {
    const hasNoData =
      dto.title === undefined &&
      dto.description === undefined &&
      dto.completed === undefined;

    if (hasNoData) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    const existingTodo = await this.prisma.todo.findFirst({
      where: {
        id: todoId,
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingTodo) {
      throw new NotFoundException('ToDo não encontrado');
    }

    const updatedTodo = await this.prisma.todo.update({
      where: {
        id: existingTodo.id,
      },
      data: {
        title: dto.title,
        description: dto.description,
        completed: dto.completed,
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
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      message: 'ToDo atualizado com sucesso',
      todo: updatedTodo,
    };
  }

  async delete(currentUser: AuthenticatedUser, todoId: string) {
    const existingTodo = await this.prisma.todo.findFirst({
      where: {
        id: todoId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!existingTodo) {
      throw new NotFoundException('ToDo não encontrado');
    }

    await this.prisma.todo.delete({
      where: {
        id: existingTodo.id,
      },
    });

    return {
      message: 'ToDo removido com sucesso',
      deletedTodo: existingTodo,
    };
  }

  private buildOrderBy(
    sortBy: TodoSortField = 'createdAt',
    order: TodoSortOrder = 'asc',
  ): Prisma.TodoOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'title':
        return [
          {
            title: order,
          },
          {
            id: 'asc',
          },
        ];

      case 'completed':
        return [
          {
            completed: order,
          },
          {
            createdAt: 'asc',
          },
          {
            id: 'asc',
          },
        ];

      case 'createdAt':
      default:
        return [
          {
            createdAt: order,
          },
          {
            id: 'asc',
          },
        ];
    }
  }
}
