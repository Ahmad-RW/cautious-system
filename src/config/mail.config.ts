import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailConfig = () => {
  const commonConfig = {
    template: {
      dir: join(__dirname, '..', 'utils/mail/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    options: {
      partials: {
        dir: join(__dirname, '..', 'utils/mail/templates'),
        options: {
          strict: true,
        },
      },
    },
  };

  return process.env.NODE_ENV === 'test'
    ? {
        ...commonConfig,
        transport: {
          host: process.env.TEST_MAIL_HOST,
          secure: Number(process.env.TEST_MAIL_SECURE),
          port: process.env.TEST_MAIL_PORT,

          auth: {
            user: process.env.TEST_MAIL_EMAIL,
            pass: process.env.TEST_MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `${process.env.MAIL_FROM}<${process.env.TEST_MAIL_EMAIL}>`,
        },
      }
    : {
        ...commonConfig,
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: Number(process.env.MAIL_SECURE),
          auth: {
            user: process.env.MAIL_EMAIL,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `${process.env.MAIL_FROM}<${process.env.MAIL_EMAIL}>`,
        },
      };
};
