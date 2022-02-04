import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/utils/mail/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mail'),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
