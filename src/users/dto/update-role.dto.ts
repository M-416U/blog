import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ enum: ['admin', 'writer', 'user'] })
  @IsEnum(['admin', 'writer', 'user'])
  role: string;
}