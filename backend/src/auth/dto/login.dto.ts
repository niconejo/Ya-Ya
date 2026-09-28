import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsString()
  password: string;
}
