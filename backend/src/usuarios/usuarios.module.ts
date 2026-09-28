import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmprendedorProfile } from './entities/emprendedor-profile.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmprendedorProfile])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [TypeOrmModule, UsuariosService],
})
export class UsuariosModule {}
