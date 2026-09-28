import { IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateQuoteDto {
  @IsUUID()
  serviceId: string;

  @IsString()
  @MinLength(10, { message: 'Describe lo que necesitas con al menos 10 caracteres' })
  mensaje: string;

  // Presupuesto que el cliente tiene en mente (opcional). El precio
  // "oficial" lo propone el emprendedor al responder la cotización.
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPropuesto?: number;
}
