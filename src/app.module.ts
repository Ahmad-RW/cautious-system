import * as path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import {
  AcceptLanguageResolver,
  I18nJsonParser,
  I18nModule,
} from 'nestjs-i18n';
import { AllExceptionsFilter } from 'src/common/filters/http-exception.filter';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule } from 'src/config/config.module';
import { CountriesModule } from 'src/countries/countries.module';
import { DatabaseModule } from 'src/database/database.module';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { MailModule } from 'src/utils/mail/mail.module';
import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/utils/queues/queues.module';
import { RedisModule } from 'src/utils/redis/redis.module';
import { SchedulerModule } from 'src/utils/scheduler/scheduler.module';
import { SearchModule } from './utils/search/search.module';
import { StateModule } from 'src/utils/state/state.module';
import { ThrottlerGuard } from 'src/common/throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { TranslationModule } from 'src/utils/i18n/translation/translation.module';
import { UploadsModule } from 'src/utils/uploads/uploads.module';
import { UsersModule } from 'src/users/users.module';
import { globalThrottler } from 'src/common/constants/throttler.const';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot(globalThrottler),
    DatabaseModule,
    MailModule,
    CommonModule,
    UsersModule,
    AuthModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',

      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/utils/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    MailModule,
    CountriesModule,
    InvitationsModule,
    UploadsModule,
    StateModule,
    RedisModule,
    QueuesModule,
    SchedulerModule,
    TranslationModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
