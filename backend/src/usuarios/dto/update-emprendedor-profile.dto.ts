import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmprendedorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(600, { message: 'La bio no puede superar los 600 caracteres' })
  bio?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  telefonoContacto?: string;
}
