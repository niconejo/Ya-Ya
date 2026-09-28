import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmprendedorProfile } from './entities/emprendedor-profile.entity';
import { normalizeRut } from '../common/utils/rut.util';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(EmprendedorProfile)
    private readonly profilesRepo: Repository<EmprendedorProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    // select: false en password (ver entidad) obliga a pedirlo explícito
    // acá, porque AuthService sí necesita compararlo al hacer login.
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    nombre: string;
    rut: string;
    role: User['role'];
  }): Promise<User> {
    const rutNormalizado = normalizeRut(data.rut);

    const existente = await this.usersRepo.findOne({
      where: [{ email: data.email }, { rut: rutNormalizado }],
    });
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email o RUT');
    }

    const user = this.usersRepo.create({
      email: data.email,
      password: data.passwordHash,
      nombre: data.nombre,
      rut: rutNormalizado,
      role: data.role,
    });

    return this.usersRepo.save(user);
  }

  async updateNombre(userId: string, nombre: string): Promise<User> {
    const user = await this.findById(userId);
    user.nombre = nombre;
    return this.usersRepo.save(user);
  }

  /**
   * Devuelve (creando si aún no existe) el perfil extendido de un
   * emprendedor. Todo usuario con role=emprendedor debería tener uno,
   * pero se crea "al vuelo" la primera vez que lo edita o consulta,
   * para no forzar un paso extra obligatorio en el registro (B3).
   */
  async getOrCreateEmprendedorProfile(
    userId: string,
  ): Promise<EmprendedorProfile> {
    let profile = await this.profilesRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profilesRepo.create({ userId });
      profile = await this.profilesRepo.save(profile);
    }
    return profile;
  }

  async updateEmprendedorProfile(
    userId: string,
    data: Partial<Pick<EmprendedorProfile, 'bio' | 'comuna' | 'telefonoContacto'>>,
  ): Promise<EmprendedorProfile> {
    const profile = await this.getOrCreateEmprendedorProfile(userId);
    Object.assign(profile, data);
    return this.profilesRepo.save(profile);
  }

  /**
   * Perfil público de un emprendedor (lo que ve un cliente al entrar a
   * su ficha). Combina datos base de User con EmprendedorProfile.
   */
  async getPublicEmprendedorProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || user.role !== 'emprendedor') {
      throw new NotFoundException('Emprendedor no encontrado');
    }
    const profile = await this.getOrCreateEmprendedorProfile(userId);

    return {
      id: user.id,
      nombre: user.nombre,
      verificado: user.verificado,
      bio: profile.bio,
      comuna: profile.comuna,
      telefonoContacto: profile.telefonoContacto,
      calificacionPromedio: profile.calificacionPromedio,
      cantidadTrabajosRealizados: profile.cantidadTrabajosRealizados,
    };
  }
}
