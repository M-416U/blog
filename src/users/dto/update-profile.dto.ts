import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  avatar?: string;
}
