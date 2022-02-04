import { ConfigService } from '@nestjs/config';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { IAppConfigOptions } from 'src/config/app.config';
import {
  ThrottlerGuard as MainThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ThrottlerGuard extends MainThrottlerGuard {
  constructor(
    readonly options: ThrottlerModuleOptions,
    readonly storageService: ThrottlerStorageService,
    readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super(options, storageService, reflector);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.get<IAppConfigOptions>('env').nodeEnv === 'test')
      return true;

    return super.canActivate(context);
  }
}
