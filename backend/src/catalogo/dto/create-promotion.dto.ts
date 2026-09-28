import { IsDateString, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsNumber()
  @Min(1, { message: 'El descuento debe ser al menos 1%' })
  @Max(90, { message: 'El descuento no puede superar el 90%' })
  porcentajeDescuento: number;

  @IsDateString({}, { message: 'fechaInicio debe ser una fecha válida (YYYY-MM-DD)' })
  fechaInicio: string;

  @IsDateString({}, { message: 'fechaFin debe ser una fecha válida (YYYY-MM-DD)' })
  fechaFin: string;
}
