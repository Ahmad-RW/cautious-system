import { APP_GUARD } from '@nestjs/core';
import { AuthController } from 'src/auth/controllers/auth.controller';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthService } from 'src/auth/services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Global, Module, forwardRef } from '@nestjs/common';
import { JwtAuthenticationStrategy } from 'src/auth/jwt-strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { QueuesModule } from 'src/utils/queues/queues.module';
import { RedisModule } from 'src/utils/redis/redis.module';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesPermissionsController } from 'src/auth/controllers/roles-permissions.controller';
import { RolesPermissionsService } from 'src/auth/services/roles-permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
import { UsersModule } from 'src/users/users.module';
import { VerificationsRepository } from 'src/auth/verifications.repository';

export const JWT_EXPIRY = 320000;

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('auth'),
    }),
    TypeOrmModule.forFeature([VerificationsRepository, UserRepository]),
    RedisModule,
    QueuesModule,
  ],
  controllers: [AuthController, RolesPermissionsController],
  providers: [
    AuthService,
    JwtAuthenticationStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    RolesPermissionsService,
  ],
  exports: [AuthService, RolesPermissionsService],
})
export class AuthModule {}
