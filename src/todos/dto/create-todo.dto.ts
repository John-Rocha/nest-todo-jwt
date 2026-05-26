import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value.trim())
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }: { value: string }) => value.trim())
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed!: boolean;
}
