export interface IUploadsConfigOptions {
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_PUBLIC_BUCKET_NAME: string;
  AWS_UPLOAD_PATH: string;
  AWS_TEMP_UPLOAD_PATH: string;
  AWS_ACL: string;
  SIGNED_URL_EXPIRE_SECONDS: number;
  AWS_BUCKET_URL: string;
}
export const uploadsConfig = (): IUploadsConfigOptions => ({
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_PUBLIC_BUCKET_NAME: process.env.AWS_PUBLIC_BUCKET_NAME,
  AWS_ACL: process.env.AWS_ACL,
  SIGNED_URL_EXPIRE_SECONDS: 60 * 5,
  AWS_BUCKET_URL: process.env.AWS_BUCKET_URL,
  AWS_UPLOAD_PATH: process.env.AWS_UPLOAD_PATH,
  AWS_TEMP_UPLOAD_PATH: process.env.AWS_TEMP_UPLOAD_PATH,
});
