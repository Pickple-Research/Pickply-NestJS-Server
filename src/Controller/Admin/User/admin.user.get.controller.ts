import { Controller, Inject, Param, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoUserFindService, MongoUserStatService } from "src/Mongo";
import { UserType } from "src/Object/Enum";
import { encrypt } from "src/Util/crypto.util";
import { Public } from "src/Security/Metadata";

/**
 * 관리자만 사용하는 유저 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserGetController {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserStatService: MongoUserStatService;

  /**
   * 회원 기본 정보를 모두 가져옵니다.
   * @author 승원
   */
  // @Roles(UserType.ADMIN)
  @Public() // 추후 삭제
  @Get("")
  async getUsers() {
    const users = await this.mongoUserFindService.getUsers({});
    return encrypt(users);
  }

  /**
   * 유저에 대한 통계 정보를 특정 조건에 맞춰 가져옵니다. 필요할 때마다 맞춰서 사용합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("stat")
  async getUserStat() {
    return await this.mongoUserStatService.getStat();
  }

  /**
   * 이메일/닉네임 정규식으로 유저를 검색합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get(":token")
  async getUsersByEmailRegex(@Param("token") token: string) {
    if (token.length < 3) return [];
    return await this.mongoUserFindService.getUsers({
      filterQuery: {
        $or: [{ email: { $regex: token } }, { nickname: { $regex: token } }],
      },
      selectQuery: { email: true, nickname: true, credit: true },
    });
  }
}
