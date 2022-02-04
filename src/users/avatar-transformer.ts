import {
  IUploadsConfigOptions,
  uploadsConfig,
} from 'src/config/uploads.config';
import { Injectable } from '@nestjs/common';
import { ValueTransformer } from 'typeorm';

@Injectable()
export class AvatarTransformer implements ValueTransformer {
  uploadsConfig: IUploadsConfigOptions;
  constructor() {
    this.uploadsConfig = uploadsConfig();
  }

  from(value: string): string {
    if (!value) {
      return null;
    }
    return (
      this.uploadsConfig.AWS_BUCKET_URL +
      this.uploadsConfig.AWS_UPLOAD_PATH +
      value
    );
  }

  to(value: string): string {
    return value;
  }
}
