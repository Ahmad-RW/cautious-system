import { BlacklistValidator } from 'src/users/users.validator';
import { IsNotEmpty, Validate } from 'class-validator';
import { UniqueValidator } from 'src/common/common.validator';
import { User } from 'src/users/entities/user.entity';

export class EmailDto {
  @IsNotEmpty()
  @Validate(UniqueValidator, [User, 'email'])
  @Validate(BlacklistValidator, ['email'])
  email: string;
}
