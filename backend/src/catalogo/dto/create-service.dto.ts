import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { UnidadPrecio } from '../entities/service.entity';

export class CreateServiceDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  titulo: string;

  @IsString()
  @MinLength(20, {
    message: 'La descripción debe tener al menos 20 caracteres',
  })
  descripcion: string;

  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

  @IsOptional()
  @IsEnum(UnidadPrecio)
  unidadPrecio?: UnidadPrecio;

  @IsOptional()
  @IsString()
  comuna?: string;
}
