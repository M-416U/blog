import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ContentStatusDto {
  @ApiProperty()
  @IsBoolean()
  status: boolean;
}
