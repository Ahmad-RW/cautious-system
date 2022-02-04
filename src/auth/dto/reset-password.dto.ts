import { EMAILS } from 'src/utils/queues/emails.enum';
import { IsNotEmpty, Validate } from 'class-validator';
import { ValidToken } from 'src/common/common.validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  password: string;

  @Validate(ValidToken, [EMAILS.RESET_PASSWORD, 'error.invalidToken'])
  @IsNotEmpty()
  token: string;
}
