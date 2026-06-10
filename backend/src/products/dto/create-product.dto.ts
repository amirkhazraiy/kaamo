import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ type: String, example: 'Arcopal Lotus Dinner Set' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String, example: 'A durable glassware dinner set for daily use.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: Number, example: 2500000, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ type: Number, example: 2200000, minimum: 0, nullable: true })
  @ValidateIf((dto) => dto.discountPrice !== null && dto.discountPrice !== undefined)
  @IsNumber()
  @Min(0)
  discountPrice?: number | null;

  @ApiProperty({ type: Number, example: 12, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ type: String, example: 'Dinnerware' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ type: String, example: 'https://kaamo.ir/uploads/products/lotus.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    example: ['https://kaamo.ir/uploads/products/lotus-1.jpg'],
    type: () => [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: String, example: 'ARC-LOTUS-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ type: String, example: 'Arcopal' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ type: Number, example: 6, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  persons?: number;

  @ApiPropertyOptional({ type: Number, example: 26, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number;

  @ApiPropertyOptional({ type: Number, example: 3, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
