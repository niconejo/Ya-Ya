import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Follow } from './entities/follow.entity';
import { Collaboration } from './entities/collaboration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Follow, Collaboration])],
  exports: [TypeOrmModule],
})
export class SocialModule {}
