import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;
}
