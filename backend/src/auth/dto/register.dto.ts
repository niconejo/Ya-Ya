import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../usuarios/entities/user.entity';
import { IsValidRut } from '../../common/validators/is-valid-rut.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsValidRut({ message: 'El RUT ingresado no es válido' })
  rut: string;

  // A propósito NO se permite registrar un "admin" desde este endpoint
  // público: ese rol solo se asigna manualmente en la base de datos o
  // desde un panel de administración protegido (fuera del alcance de B3).
  @IsIn([UserRole.CLIENTE, UserRole.EMPRENDEDOR], {
    message: 'role debe ser "cliente" o "emprendedor"',
  })
  role: UserRole;
}
