import { Controller, Inject, Param, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoUserFindService, MongoUserStatService } from "src/Mongo";
import { UserType } from "src/Object/Enum";
import { encrypt } from "src/Util/crypto.util";
import { Public } from "src/Security/Metadata";
import { UserFindService } from "src/Service";

/**
 * 관리자만 사용하는 유저 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserGetController {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserStatService: MongoUserStatService;
  @Inject() private readonly userFindService: UserFindService;

  /**
   * 회원 기본 정보를 모두 가져옵니다.
   * @author 승원
   *
   * 유저의 기본 정보와 특성 정보를 DB에서
   *  가져와서 합친 후 반환합니다.
   *
   * @return 유저의 기본 정보와 특성 정보가 합쳐진 배열
   */
  @Roles(UserType.ADMIN)
  @Get("")
  async getUsers() {
    const users = await this.mongoUserFindService.getUsers({});
    //const usersProperties = await this.mongoUserFindService.getUserProperties({});
    //const usersAndProperties = await this.mongoUserFindService.getUsersAndProperties({});

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

  /**
   *
   * @author 승원
   */
  @Roles(UserType.ADMIN)
  @Get(":userId")
  async getUserInfo(@Param("userId") userId: string) {
    const getUserInfo = await this.mongoUserFindService.getUserInfoById(userId);

    const getUserActivities = await this.userFindService.getUserActivities({
      userId,
    });

    const user = await Promise.all([getUserInfo, getUserActivities]).then(
      ([userInfo, userActivities]) => {
        // console.log(userInfo)
        return {
          ...userInfo,
          userActivities,
        };
      },
    );
    return encrypt(user);
  }
}
