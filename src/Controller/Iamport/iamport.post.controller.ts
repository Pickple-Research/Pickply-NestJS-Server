import { Controller, Request, Body, Post, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Public } from "src/Security/Metadata";

/**
 * 아임포트 결제 관련 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("iamport")
export class IamportPostController {
  constructor() {}

  /**
   * 앱단에서 아임포트를 이용해 결제를 완료하는 경우 자동으로 호출되는 API 입니다.
   * 결제 정보가 유효한지 검증하고, 유효하다면 결제 정보를 DB에 저장합니다.
   * @author 현웅
   */
  @Public()
  @Post("webhook")
  async webhookTest(@Body() body: { imp_uid: string; merchant_uid: string }) {
    console.log(`webhook body: ${body}`);
    return "webhook received";
  }
}
