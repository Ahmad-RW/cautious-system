import { EMAILS } from 'src/utils/queues/emails.enum';
import { IsNotEmpty, Validate } from 'class-validator';
import { ValidToken } from 'src/common/common.validator';

export class VerifyEmail {
  @IsNotEmpty()
  @Validate(ValidToken, [EMAILS.EMAIL_VERIFICATION, 'error.invalidToken'])
  token: string;
}
