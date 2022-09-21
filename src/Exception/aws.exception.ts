import { Status400Exception } from "./Status";

/**
 * S3 버킷에 지정하지 않은 파일을 업로드하는 경우
 * @author 현웅
 */
export class UnsupportedFileTypeException extends Status400Exception {
  constructor() {
    super({ customMessage: "지원하지 않는 파일 형식입니다" });
  }
}
