import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosService } from './todos.service';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todosService.create(currentUser, dto);
  }

  @Get()
  async findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.todosService.findAll(currentUser);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') todoId: string,
  ) {
    return this.todosService.findOne(currentUser, todoId);
  }
}
