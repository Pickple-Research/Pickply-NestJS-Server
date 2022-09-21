import { Injectable } from "@nestjs/common";
import { S3, config } from "aws-sdk";
import { S3UploadingObject, S3Object } from "../Object/Type";

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor() {
    //?s3 서비스를 사용하도록 도와주는 객체를 만듭니다.
    this.s3 = new S3();

    //? AWS 서비스를 사용하기 위하여 IAM 인증을 진행합니다.
    //? (해당 유저는 Pickple-S3입니다. 주어진 권한은 AWS IAM 에서 확인할 수 있습니다.)
    config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  /**
   * S3 버킷에 주어진 파일 하나를 업로드합니다.
   * @author 현웅
   */
  async uploadObject(object: S3UploadingObject) {
    return await this.s3.upload(object).promise();
  }

  /**
   * S3 버킷에서 파일을 하나 가져옵니다.
   * @author 현웅
   */
  async getObject(objectInfo: S3Object) {
    const object = await this.s3
      .getObject({ Bucket: objectInfo.Bucket, Key: objectInfo.Key })
      .promise();
    return object;
  }

  /**
   * bucket에서 파일(들)을 가져옵니다.
   * @author 현웅
   */
  async getFiles() {
    const keys = ["thumb", "image0", "image1", "image2"];
    //? Promise.all()을 사용하여 파일 하나를 가져오는 함수를 병렬적으로 호출합니다.
    const objects = await Promise.all([
      keys.forEach((Key) => {
        this.getObject({ Bucket: "pickple-research", Key: Key });
      }),
    ]);

    return objects;
  }
}
