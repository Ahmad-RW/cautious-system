import { EmailPayload } from 'src/common/interfaces/email-payload.interface';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('emails') private readonly emailsQueue: Queue) {}

  async addToEmailsQueue(KEY: string, payload: EmailPayload) {
    await this.emailsQueue.add(KEY, {
      ...payload,
    });
  }
}
