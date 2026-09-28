import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  /**
   * Passport llama esto automáticamente después de verificar la firma
   * y expiración del token. Lo que retornemos acá queda disponible
   * como `request.user` en cualquier controlador protegido con
   * JwtAuthGuard (ver CurrentUser decorator).
   */
  async validate(payload: JwtPayload) {
    try {
      return await this.usuariosService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('Token inválido o usuario inexistente');
    }
  }
}
