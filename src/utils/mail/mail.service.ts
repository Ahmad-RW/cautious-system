import { ConfigService } from '@nestjs/config';
import { IAppConfigOptions } from 'src/config/app.config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
  private readonly frontendUrl: string;
  private readonly RESET_PASSWORD_FRONTEND_ROUTE: string;
  private readonly VERIFY_EMAIL_FRONTEND_ROUTE: string;
  private readonly INVITED_REGISTRATION_FRONTEND_ROUTE: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<IAppConfigOptions>('env').frontendUrl;
    this.RESET_PASSWORD_FRONTEND_ROUTE = `${this.frontendUrl}reset-password`;
    this.VERIFY_EMAIL_FRONTEND_ROUTE = `${this.frontendUrl}auth/verify`;
    this.INVITED_REGISTRATION_FRONTEND_ROUTE = `${this.frontendUrl}invite/register`;
  }

  async sendUserConfirmation(email: string, username: string, token: string) {
    const url = `${this.VERIFY_EMAIL_FRONTEND_ROUTE}/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to CTB! Confirm your Email',
      template: './confirmation',
      context: {
        name: username,
        url,
      },
    });
  }

  async sendResetPassword(email: string, username: string, token: string) {
    const url = `${this.RESET_PASSWORD_FRONTEND_ROUTE}/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'CTB || Reset Password email ',
      template: './reset',
      context: {
        name: username,
        url,
      },
    });
  }

  async sendInvitationEmail(
    email: string,
    username: string,
    token: string,
    role: string,
  ) {
    const url = `${this.INVITED_REGISTRATION_FRONTEND_ROUTE}?token=${token}&role=${role}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'CTB ||  Invitation ',
      template: './invitation',
      context: {
        name: username,
        role: role,
        support: 'support@ctb.sa',
        url,
      },
    });
  }

  async sendAccountActivationEmail(email: string, username: string) {
    const url = `${this.frontendUrl}/login`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'CTB || You’ve been activated ',
      template: './activation',
      context: {
        name: username,
        support: 'support@ctb.sa',
        url,
      },
    });
  }

  async sendAccountSuspensionEmail(email: string, username: string) {
    const url = `${this.frontendUrl}/login`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'CTB || You’ve been suspended',
      template: './suspension',
      context: {
        name: username,
        support: 'support@ctb.sa',
        url,
      },
    });
  }
}
