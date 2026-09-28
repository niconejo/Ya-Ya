import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../usuarios/entities/user.entity';

/**
 * Extrae el usuario ya autenticado (dejado en request.user por
 * JwtStrategy) para usarlo directo como parámetro del controlador:
 * ej. getMe(@CurrentUser() user: User) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
