import { S3UploadingObject, S3ACL } from "../Object/Type";

/**
 * S3 버킷에 올릴 수 있는 형태의 Object를 반환합니다.
 * @param BucketName 객체를 업로드할 버킷 이름
 * @param file 객체 파일
 * @param ACL 객체 접근 권한
 * @param Key 버킷 내 객체 경로
 * @author 현웅
 */
export function getS3UploadingObject(param: {
  BucketName: string;
  file: Express.Multer.File;
  ACL: S3ACL;
  Key: string;
}): S3UploadingObject {
  return {
    Bucket: param.BucketName,
    Body: param.file.buffer,
    ACL: param.ACL,
    Key: param.Key,
  };
}
