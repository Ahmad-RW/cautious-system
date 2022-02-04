import { InvitationsModule } from 'src/invitations/invitations.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { UserScheduler } from 'src/utils/scheduler/user-scheduler.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ScheduleModule.forRoot(), InvitationsModule, UsersModule],
  providers: [SchedulerService, UserScheduler],
})
export class SchedulerModule {}
