import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.usuariosService.create({
      email: dto.email,
      passwordHash,
      nombre: dto.nombre,
      rut: dto.rut,
      role: dto.role,
    });

    return this.buildAuthResponse(user.id, user.email, user.role, user.nombre);
  }

  async login(dto: LoginDto) {
    const user = await this.usuariosService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user.id, user.email, user.role, user.nombre);
  }

  private buildAuthResponse(
    userId: string,
    email: string,
    role: string,
    nombre: string,
  ) {
    const payload: JwtPayload = { sub: userId, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: userId, email, role, nombre },
    };
  }
}
