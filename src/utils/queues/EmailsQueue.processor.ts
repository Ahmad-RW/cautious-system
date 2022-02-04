import { EMAILS } from 'src/utils/queues/emails.enum';
import { EmailPayload } from 'src/common/interfaces/email-payload.interface';
import { MailService } from 'src/utils/mail/mail.service';
import { Process, Processor } from '@nestjs/bull';

interface IMailData {
  data: EmailPayload;
}

@Processor('emails')
export class EmailsQueueConsumer {
  constructor(private readonly mailService: MailService) {}

  @Process(EMAILS.EMAIL_VERIFICATION)
  async sendActivationEmail({ data }: IMailData) {
    const { email, username, token } = data;
    await this.mailService.sendUserConfirmation(email, username, token);
  }

  @Process(EMAILS.RESET_PASSWORD)
  async sendResetPasswordEmail({ data }: IMailData) {
    const { email, username, token } = data;
    await this.mailService.sendResetPassword(email, username, token);
  }

  @Process(EMAILS.INVITATION_EMAIL)
  async sendInvitationEmail({ data }: IMailData) {
    const { email, username, token, role } = data;
    await this.mailService.sendInvitationEmail(email, username, token, role);
  }

  @Process(EMAILS.ACCOUNT_ACTIVATION)
  async sendAccountActivationEmail({ data }: IMailData) {
    const { email, username } = data;
    await this.mailService.sendAccountActivationEmail(email, username);
  }

  @Process(EMAILS.ACCOUNT_SUSPENSION)
  async sendAccountSuspensionEmail({ data }: IMailData) {
    const { email, username } = data;
    await this.mailService.sendAccountSuspensionEmail(email, username);
  }
}
