import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    username: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(255)
    password: string;
}
