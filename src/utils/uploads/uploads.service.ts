import * as AWS from 'aws-sdk';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ConfigService } from '@nestjs/config';
import { IUploadsConfigOptions } from 'src/config/uploads.config';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class UploadsService {
  uploadsConfig: IUploadsConfigOptions;
  bucket: string;
  uploadPath: string;
  tempUploadPath: string;
  constructor(private readonly configService: ConfigService) {
    this.uploadsConfig = configService.get<IUploadsConfigOptions>('uploads');
    const {
      AWS_ACCESS_KEY_ID: accessKeyId,
      AWS_SECRET_ACCESS_KEY: secretAccessKey,
      AWS_REGION: region,
      AWS_PUBLIC_BUCKET_NAME,
      AWS_UPLOAD_PATH,
      AWS_TEMP_UPLOAD_PATH,
    } = this.uploadsConfig;
    this.bucket = AWS_PUBLIC_BUCKET_NAME;
    this.uploadPath = AWS_UPLOAD_PATH;
    this.tempUploadPath = AWS_TEMP_UPLOAD_PATH;

    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    });
  }

  async generateUrl() {
    const filename = nanoid(30);
    const s3 = new AWS.S3();
    const { SIGNED_URL_EXPIRE_SECONDS: Expires, AWS_ACL: ACL } =
      this.uploadsConfig;
    const url = s3.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Expires,
      ACL,
      Key: this.tempUploadPath + filename,
    });
    return {
      uploadUrl: url,
      fileName: filename,
    };
  }

  async syncFile(fileName: string) {
    const s3 = new AWS.S3();
    const { AWS_ACL: ACL } = this.uploadsConfig;

    const copyParams = {
      Bucket: this.bucket,
      CopySource: encodeURI(
        `/${this.bucket}/${this.tempUploadPath}${fileName}`,
      ),
      Key: this.uploadPath + fileName,
      ACL,
    };

    try {
      await s3.copyObject(copyParams).promise();
      await this.deleteFile(fileName, true);
    } catch (err) {
      throw new BadRequestException('error.fileDoesntExist');
    }
  }

  async deleteFile(fileName: string, isTemp = false) {
    const s3 = new AWS.S3();
    const deleteParams = {
      Bucket: this.bucket,
      Key: isTemp ? this.tempUploadPath : this.uploadPath + fileName,
    };
    try {
      await s3.deleteObject(deleteParams).promise();
    } catch (err) {
      // log error to sentry ...
      console.log(err);
    }
  }
}
