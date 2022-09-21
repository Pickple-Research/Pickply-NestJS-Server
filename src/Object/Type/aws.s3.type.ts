import { PutObjectRequest } from "aws-sdk/clients/s3";

/**
 * S3 bucket에 파일 업로드시 필요한 정보들입니다.
 * @author 현웅
 */
export interface S3UploadingObject extends PutObjectRequest {
  Bucket: string;
  Body: Buffer;
  Key: string;
  ACL: S3ACL;
  Metadata?: Record<string, string>;
}

export type S3ACL =
  | "private"
  | "public-read"
  | "public-read-write"
  | "authenticated-read"
  | "aws-exec-read"
  | "bucket-owner-read"
  | "bucket-owner-full-control";

/**
 * S3 bucket에서 파일을 가져올 때 필요한 정보들입니다.
 * @author 현웅
 */
export type S3Object = {
  Bucket: string;
  Key: string;
};
