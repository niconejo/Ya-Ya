import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isValidRut } from '../utils/rut.util';

/**
 * Decorador reutilizable para validar RUT chileno en cualquier DTO.
 * Uso: @IsValidRut() rut: string;
 */
export function IsValidRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidRut',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidRut(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es un RUT chileno válido`;
        },
      },
    });
  };
}
