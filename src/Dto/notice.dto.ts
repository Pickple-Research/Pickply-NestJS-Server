import { IsString } from "class-validator";

/**
 * 새로운 공지 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param title
 * @param content
 * @author 현웅
 */
export class NoticeCreateBodyDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
