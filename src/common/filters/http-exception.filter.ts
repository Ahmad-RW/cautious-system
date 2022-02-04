import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { CommonException } from 'src/common/exceptions/common';
import { I18nService } from 'nestjs-i18n';
import { IErrorResponse } from 'src/common/interfaces/error-response.interface';
import { Response } from 'express';

@Catch(CommonException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse() as Record<string, any>;
    const statusCode = exception.getStatus();
    const messages: IErrorResponse[] = [];

    if (exceptionResponse.validationPipeError) {
      for (const error of exceptionResponse.errors) {
        for (const key of error.messages) {
          const translated = await this.i18n.translate(key, {
            lang: ctx.getRequest().i18nLang,
            args: { property: error.property },
          });
          messages.push({
            message: translated,
            property: error.property,
          });
        }
      }
    } else {
      for (const error of exceptionResponse.errors) {
        const translated = await this.i18n.translate(error.message, {
          lang: ctx.getRequest().i18nLang,
          args: exceptionResponse.args,
        });
        messages.push({
          message: translated,
          property: error.property,
        });
      }
    }

    response.status(statusCode).json({ statusCode, errors: messages });
  }
}
