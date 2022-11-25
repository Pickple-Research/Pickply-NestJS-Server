import { Controller, Request, Get } from "@nestjs/common";
import { JwtUserInfo } from "src/Object/Type";

/**
 * 아임포트 결제 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("iamport")
export class IamportGetController {
  constructor() {}

  /**
   * 아임포트 결제 요청 전에 고유한 merchant_uid 를 생성하여 반환합니다.
   * 결제 프로세스가 진행되지 전에 일종의 서버 헬스 체크처럼 기능하기도 합니다.
   * @author 현웅
   */
  @Get("merchantUid")
  async getMerchantUid(@Request() req: { user: JwtUserInfo }) {
    return `${req.user.userId}_${new Date().getTime()}`;
  }
}
