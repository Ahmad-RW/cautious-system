import { BlacklistValidator } from 'src/users/users.validator';
import { IsNotEmpty, Validate } from 'class-validator';
import { UniqueValidator } from 'src/common/common.validator';
import { User } from 'src/users/entities/user.entity';

export class UsernameDto {
  @IsNotEmpty()
  @Validate(UniqueValidator, [User, 'username'])
  @Validate(BlacklistValidator, ['username'])
  username: string;
}
