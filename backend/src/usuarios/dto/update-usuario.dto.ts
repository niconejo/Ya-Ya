import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;
}
