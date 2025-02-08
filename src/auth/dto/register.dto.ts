import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "johndoe" })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    enum: ["superadmin", "admin", "writer", "user"],
    default: "user",
  })
  @IsEnum(["superadmin", "admin", "writer", "user"])
  role: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  interests?: string[];
}
