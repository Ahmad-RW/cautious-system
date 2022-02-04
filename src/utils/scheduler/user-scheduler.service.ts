import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class UserScheduler {
  constructor(private readonly userService: UsersService) {}
  @Cron(CronExpression.EVERY_10_HOURS)
  async softDeleteUnverifiedUsers() {
    await this.userService.softDeleteUsersOverGracePeriod();
  }
}
