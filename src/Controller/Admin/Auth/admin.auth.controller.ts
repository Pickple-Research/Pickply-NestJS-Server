import { Body, Controller, Post } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { Public } from "src/Security/Metadata";
import { UserType } from "src/Object/Enum";
import { MongoUserFindService } from "src/Mongo";
import { LoginBodyDto } from "src/Dto";
import { AuthService } from "src/Service";

/**
 * 관리자만 사용하는 Auth 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/auth")
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mongoUserFindService: MongoUserFindService
  ) { }

  /**
   * 
   * 관리자용 로그인 API입니다. 반환된 유저의 type이 ADMIN 이 아닌 경우 에러를 일으킵니다.
   * @author 현웅
   * @add 승원
   * @Param email, password
   * 
   *
   * 
   */
  @Public()//추후 삭제
  @Post("login/email")
  async adminLogin(@Body() body: LoginBodyDto) {
    const getUserInfo = this.mongoUserFindService.getUserInfoByEmail(body.email)
    const authenticate = this.authService.authenticate(body.email, body.password)
    const userInfo = await Promise.all([getUserInfo, authenticate]).then(
      ([userInfo, _]) => {
        return userInfo;

      },
    );

    const jwt = await this.authService.issueJWT({
      userType: userInfo.user.userType,
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    })

    return {
      jwt, userInfo
    }


  }

  /**
   * JWT 를 이용한 관리자용 로그인 API 입니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("login/jwt")
  async adminLoginWithJwt() { }
}
