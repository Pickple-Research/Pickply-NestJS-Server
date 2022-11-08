import { Body, Controller, Inject, Post } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import {
  MongoResearchStandardizeService,
  MongoVoteStandardizeService,
} from "src/Mongo";
import { Public } from "src/Security/Metadata";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 Auth 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/auth")
export class AdminAuthController {
  constructor() {}

  /**
   * 관리자용 로그인 API입니다. 반환된 유저의 type이 ADMIN 이 아닌 경우 에러를 일으킵니다.
   * @author 현웅
   */
  @Public()
  @Post("login/email")
  async adminLogin(
    @Body() body: { email: string; password: string; fcmToken?: string },
  ) {}

  /**
   * JWT 를 이용한 관리자용 로그인 API 입니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("login/jwt")
  async adminLoginWithJwt() {}
}
