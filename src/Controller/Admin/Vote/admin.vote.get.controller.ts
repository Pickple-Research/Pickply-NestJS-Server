import { Controller, Inject, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import {
  MongoUserFindService,
  MongoVoteFindService,
  MongoVoteStandardizeService,
} from "src/Mongo";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 투표 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/votes")
export class AdminVoteGetController {
  constructor() {}

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteStandardizeService: MongoVoteStandardizeService;

  /**
   * 투표 관련 정보를 일괄적으로 변경합니다. 그 때마다 맞춰서 사용합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("standardize")
  async standardizeVotesData() {
    await this.mongoVoteStandardizeService.standardize();
  }

  /**
   * 복잡한 쿼리문을 실행합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("complicate")
  async getComplicatedVoteData() {
    const participations =
      await this.mongoVoteFindService.getVoteParticipations({
        filterQuery: { voteId: "635a34ea0e7ad79254ab99fe" },
        selectQuery: { userId: true },
      });
    const userIds = participations.map((participation) => participation.userId);
    const users = await this.mongoUserFindService.getUsers({
      filterQuery: { _id: { $in: userIds } },
      selectQuery: { email: true, createdAt: true },
    });
    console.log(users.length);
    const oldUsers = users.filter(
      (user) => user.createdAt < "2022-10-27T15:00:00.000Z",
    );
    console.log(oldUsers.length);
  }
}
