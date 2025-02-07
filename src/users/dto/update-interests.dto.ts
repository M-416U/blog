import { ApiProperty } from "@nestjs/swagger";

export class UpdateInterestsDto {
  @ApiProperty({ type: [String] })
  interests: string[];
}
