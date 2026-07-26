import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  incomeDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}