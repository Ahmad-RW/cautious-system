import { CompareValidator } from 'src/common/common.validator';
import { IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { PasswordStrengthValidator } from 'src/users/users.validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Validate(PasswordStrengthValidator)
  @Validate(CompareValidator, [
    'oldPassword',
    'NOT_EQUALS',
    'error.auth.newPasswordEqualsOld',
  ])
  @MaxLength(35)
  @MinLength(8)
  newPassword: string;
}
