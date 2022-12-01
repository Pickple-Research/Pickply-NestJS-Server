import { Controller, Inject, Param, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoUserFindService, MongoUserStatService } from "src/Mongo";
import { UserType } from "src/Object/Enum";

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
   *
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("stat")
  async getUserStat() {
    return await this.mongoUserStatService.getStat();
  }

  /**
   * 이메일 정규식으로 유저를 검색합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get(":email")
  async getUsersByEmailRegex(@Param("email") email: string) {
    if (email.length < 3) return [];
    return await this.mongoUserFindService.getUsers({
      filterQuery: { email: { $regex: email } },
      selectQuery: { email: true, nickname: true, credit: true },
    });
  }
}
