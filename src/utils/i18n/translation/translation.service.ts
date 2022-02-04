import { I18nRequestScopeService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nRequestScopeService) {}

  public async t(text: string, args = null): Promise<string> {
    return await this.i18n.translate(text, {
      ...args,
    });
  }
}
