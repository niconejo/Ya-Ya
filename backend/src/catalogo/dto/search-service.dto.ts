import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchServiceDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @IsIn(['relevancia', 'calificacion', 'precio_asc', 'precio_desc', 'recientes'])
  ordenarPor?: 'relevancia' | 'calificacion' | 'precio_asc' | 'precio_desc' | 'recientes';
}
