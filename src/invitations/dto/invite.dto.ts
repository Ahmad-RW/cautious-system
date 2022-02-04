import { BlacklistValidator } from 'src/users/users.validator';
import { EXISTS, UniqueValidator } from 'src/common/common.validator';
import { IsEmail, Validate } from 'class-validator';
import { Role } from 'src/auth/entities/role.entity';
import { Transform } from 'class-transformer';
import { ValidInvitationEmail } from 'src/invitations/invitations.validator';

export class InviteDto {
  @IsEmail()
  @Validate(ValidInvitationEmail, [
    'email',
    'validation.invalidInvitationEmail',
  ])
  @Validate(BlacklistValidator, ['email'])
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Validate(UniqueValidator, [Role, 'id', EXISTS])
  role: Role;
}
