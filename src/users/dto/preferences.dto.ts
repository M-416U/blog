import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsArray, IsString } from "class-validator";

export class UserPreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  preferredTags?: string[];

  @ApiProperty({ required: false })
  @IsString()
  theme?: "light" | "dark";
  @ApiProperty({ required: false })
  @IsString()
  lang?: "en" | "ar";
}
