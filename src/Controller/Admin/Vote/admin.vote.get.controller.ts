import { Controller, Inject, Get, Param } from "@nestjs/common";
import { Public, Roles } from "src/Security/Metadata";
import {
  MongoUserFindService,
  MongoVoteFindService,
  MongoVoteStandardizeService,
} from "src/Mongo";
import { UserType } from "src/Object/Enum";
import { encrypt } from "src/Util/crypto.util";

/**
 * 관리자만 사용하는 투표 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/votes")
export class AdminVoteGetController {
  constructor() { }

  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteStandardizeService: MongoVoteStandardizeService;




  /**
   * @author 승원
   * 모든 투표를 가져옵니다.
   * 그린라이트일 경우, 작성자가 익명으로 나옴
   * 추후에 service에서 처리할 예정
   */
  //@Public()
  @Roles(UserType.ADMIN)
  @Get("")
  async getVotes() {
    const votes = await this.mongoVoteFindService.getVotes({});
    return encrypt(votes);
  }


  /**
   * @author 승원
   * 특정 투표를 가져옵니다.
   * 그린라이트일 경우, 작성자가 익명으로 나옴
   * 추후에 service에서 처리할 예정
   */

  //@Public()
  @Roles(UserType.ADMIN)
  @Get(":voteId")
  async getVote(@Param("voteId") voteId: string) {
    const vote = await this.mongoVoteFindService.getVoteById(voteId);
    return encrypt(vote);
  }

  /**
   * @author: 승원
   * 특정 투표에 대한 (대)댓글을 가져옵니다.
   * 그린라이트일 경우, 작성자가 익명으로 나옴
   * 추후에 service에서 처리할 예정
   */

  //@Public()
  @Roles(UserType.ADMIN)
  @Get(":voteId/comments")
  async getVoteComments(@Param("voteId") voteId: string) {
    const comments = await this.mongoVoteFindService.getVoteComments(voteId);
    return encrypt(comments);
  }


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
