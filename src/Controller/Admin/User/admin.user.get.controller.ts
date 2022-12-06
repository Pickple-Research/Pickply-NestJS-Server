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
  constructor() { }

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserStatService: MongoUserStatService;

  /**
   * @author 승원
   * 회원 기본 정보 모두 가져오기
   */
  //@Roles(UserType.ADMIN)
  @Public()//추후 수정
  @Get("")
  async getUsers() {

    const users = await this.mongoUserFindService.getUsers({})

    return encrypt(users)


  }

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
