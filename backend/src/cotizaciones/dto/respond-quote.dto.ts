import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RespondQuoteDto {
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  precioPropuesto: number;

  @IsOptional()
  @IsString()
  mensaje?: string;
}
