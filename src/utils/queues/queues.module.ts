import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailsQueueConsumer } from 'src/utils/queues/EmailsQueue.processor';
import { MailModule } from 'src/utils/mail/mail.module';
import { Module } from '@nestjs/common';
import { QueuesService } from 'src/utils/queues/queues.service';

@Module({
  imports: [
    MailModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: config.get('redis'),
      }),
    }),
    BullModule.registerQueueAsync(
      {
        name: 'emails',
      },
      {
        name: 'notifications',
      },
    ),
  ],
  exports: [BullModule, QueuesService],
  providers: [EmailsQueueConsumer, QueuesService],
})
export class QueuesModule {}
