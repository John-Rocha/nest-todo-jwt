import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const TODO_SORT_FIELDS = ['createdAt', 'title', 'completed'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;

export type TodoSortField = (typeof TODO_SORT_FIELDS)[number];
export type TodoSortOrder = (typeof SORT_ORDERS)[number];

export class FindTodosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }: { value: boolean | string }) => {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value.trim())
  search?: string;

  @IsOptional()
  @IsIn(TODO_SORT_FIELDS)
  sortBy?: TodoSortField = 'createdAt';

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: TodoSortOrder = 'asc';
}
