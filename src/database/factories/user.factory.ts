import * as Faker from 'faker';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserStatuses } from 'src/utils/state/constants/user.state';
import { define } from 'typeorm-seeding';

define(User, (faker: typeof Faker) => {
  const user = new User();
  user.email = faker.internet.email();
  user.salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync('111', user.salt);
  user.username = faker.name.findName();
  user.status = UserStatuses.PENDING;
  return user;
});
