import {
    IsNotEmpty, IsOptional, IsString,
    IsNumber, IsDateString, MaxLength, Min, IsInt, Max
} from 'class-validator';

export class CreateBudgetDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @IsNotEmpty()
    @IsInt()
    @Min(2000)
    year: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    limitAmount: number;
}
