import {
    IsNotEmpty, IsOptional, IsString,
    IsNumber, IsDateString, MaxLength, Min
} from 'class-validator';

export class CreateIncomeDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: number;

    @IsNotEmpty()
    @IsDateString()
    incomeDate: string;
}
