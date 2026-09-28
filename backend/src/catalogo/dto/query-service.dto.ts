import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryServiceDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  // Búsqueda simple por texto en título/descripción. El motor de búsqueda
  // real (Meilisearch) se integra en B6; esto es un filtro directo en SQL
  // suficiente para B5.
  @IsOptional()
  @IsString()
  busqueda?: string;
}
