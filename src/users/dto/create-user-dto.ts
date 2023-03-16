import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString, Length} from "class-validator";

export class CreateUserDto {
    @ApiProperty({example: 'user@gmail.com', description: 'User email'})
    @IsString({message: 'Must be a string'})
    @IsEmail({},{message: 'Wrong email signature'})
    readonly email: string;
    @ApiProperty({example: '12345', description: 'User password'})
    @IsString({message: 'Must be a string'})
    @Length(4, 16, {message: 'Password must have length at least 4 and not more than 16'})
    readonly password: string;
}