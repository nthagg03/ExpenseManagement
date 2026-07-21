import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @Type(() => Number)
  @IsInt()
  userId: number;
}