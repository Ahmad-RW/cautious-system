import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/utils/queues/queues.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from 'src/utils/uploads/uploads.module';
import { UserRepository } from 'src/users/users.repository';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    UploadsModule,
    QueuesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
