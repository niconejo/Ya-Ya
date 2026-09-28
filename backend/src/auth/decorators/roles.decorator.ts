import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../usuarios/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Marca un endpoint como restringido a ciertos roles. Se usa junto con
 * RolesGuard: @Roles(UserRole.ADMIN) @UseGuards(JwtAuthGuard, RolesGuard)
 * Se deja listo desde B3 aunque recién se use fuerte en B14 (panel admin).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
