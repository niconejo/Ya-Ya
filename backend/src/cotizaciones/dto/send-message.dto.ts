import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1, { message: 'El mensaje no puede estar vacío' })
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres' })
  contenido: string;
}
