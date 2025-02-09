import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The ID of the post being commented on' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({ description: 'The ID of the parent comment (for replies)' })
  @IsMongoId()
  @IsOptional()
  parentCommentId?: string;
}
