import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { UnsupportedFileTypeException } from "../Exception";

/**
 * 파일 업로드 시 제약 조건을 반환합니다.
 * @author 현웅
 */
export function getMulterOptions(): MulterOptions {
  return {
    //? fileFilter(): 올바른 파일 형식인지 검증하는 함수를 정의합니다.
    //? jpg, jpeg, png 형식의 파일이 아닌 경우 에러를 반환합니다.
    fileFilter: (request, file, callback) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        callback(null, true);
      } else {
        callback(new UnsupportedFileTypeException(), false);
      }
    },

    //? limits: 필드/파일에 대한 제약을 설정합니다.
    //?? fileSize: 각 파일 사이즈를 10MB로 제한
    //?? files: 한번에 업로드 할 수 있는 파일 수를 12개로 제한
    limits: { fileSize: 10 * 1024 * 1024, files: 12 },
  };
}
