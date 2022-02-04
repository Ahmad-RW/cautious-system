import * as moment from 'moment';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import {
  GRACE_PERIOD,
  PG_TIMESTAMP_FORMAT,
} from 'src/common/constants/common.const';
import { User } from 'src/users/entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async saveUser(user: User): Promise<User> {
    await this.save(user);
    await user.reload();
    return user;
  }

  async saveMany(users: User[]): Promise<void> {
    await this.save(users);
  }

  getUserByEmail(email: string): Promise<User> {
    return this.findOne({ email: email });
  }

  getUserByEmailOrUsername(username: string): Promise<User> {
    return this.findOne({
      where: [{ email: username }, { username: username }],
    });
  }

  async getUsersOverGracePeriod(): Promise<User[]> {
    return await this.find({
      where: {
        createdAt: LessThan(
          moment().subtract(GRACE_PERIOD, 'days').format(PG_TIMESTAMP_FORMAT),
        ),
        emailVerifyAt: null,
      },
    });
  }
}
