import * as mailConfig from 'src/config/mail.config';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from 'src/config/app.config';
import { uploadsConfig } from 'src/config/uploads.config';
import authConfig from 'src/config/auth.config';
import databaseConfig from 'src/config/database.config';
import redisConfig from 'src/config/redis.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({ env: appConfig() }),
        () => ({ database: databaseConfig() }),
        () => ({ uploads: uploadsConfig() }),
        () => ({ auth: authConfig() }),
        () => ({ env: appConfig() }),
        () => ({ redis: redisConfig() }),
        () => ({ mail: mailConfig.mailConfig() }),
      ],
    }),
  ],
})
export class ConfigModule {}
