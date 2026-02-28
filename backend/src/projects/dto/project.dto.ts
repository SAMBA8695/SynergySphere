import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Revamp the company website' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Type(() => Number)
  userId: number;

  @ApiPropertyOptional({ enum: ['member', 'admin'], default: 'member' })
  @IsOptional()
  @IsIn(['member', 'admin'])
  role?: 'member' | 'admin' = 'member';
}
