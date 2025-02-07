import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ example: "Getting Started with NestJS" })
  title: string;

  @ApiProperty({ example: "# Welcome\nMarkdown content..." })
  content: string;

  @ApiProperty({ example: ["nestjs", "backend"] })
  tags: string[];
}
