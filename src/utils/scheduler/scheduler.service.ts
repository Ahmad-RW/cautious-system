import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InvitationsService } from 'src/invitations/invitations.service';

//This class is a provider intended to house all cron jobs.
@Injectable()
export class SchedulerService {
  constructor(private readonly invitationService: InvitationsService) {}

  // Below is just a demo.
  // @Timeout(5000)
  // handleTimeout() {
  //   console.log('called once after 5 seconds');
  // }
  // @Cron('4 * * * * *')
  // handleCron() {
  //   console.log('called every minute on the 4th second');
  // }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async terminateInvitations() {
    await this.invitationService.expireInvitations();
  }
}
