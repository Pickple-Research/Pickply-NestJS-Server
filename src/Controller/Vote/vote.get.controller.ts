import { Controller, Inject, Request, Param, Get } from "@nestjs/common";
import { get } from "http";
import { MongoVoteFindService, MongoVoteStandardizeService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { Public } from "src/Security/Metadata";

@Controller("votes")
export class VoteGetController {
  constructor() { }

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteStandardizeService: MongoVoteStandardizeService;

  /**
   * 
   * 투표 숫자를 모두 더해서 반환합니다(중복 포함)
   *회원+비회원
   * @author 승원
   *
   */
  @Public()
  @Get("result/number")
  async getResultNumber() {

    return await this.mongoVoteFindService.getResultNumber();

  }

  /**
   * 최신 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("")
  async getRecentVotes() {
    return await this.mongoVoteFindService.getRecentVotes();
  }

  @Public()
  @Get("fixed")
  async getFixedVotes() {
    return await this.mongoVoteFindService.getFixedVotes();
  }

  /**
   * HOT 투표를 가져옵니다.
   * 기준은 최근 100건의 투표 참여 중 제일 많은 참여를 이끌어낸 상위 3개의 투표입니다.
   * @author 현웅
   */
  @Public()
  @Get("hots")
  async getHotVotes() {
    return await this.mongoVoteFindService.getHotVotes();
  }

  /**
   * 비회원의 투표 참여 수를 반환합니다.
   * @author 현웅
   */
  // @Public()
  // @Get("count/nonmember")
  // async getNonmemberVoteParticipations() {
  //   return await this.mongoVoteFindService.getNonMemberVoteParticipations();
  // }

  /**
   * 최근 n일을 기준으로 HOT 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("hot/day")
  async getLastDayHotVote() {
    return await this.mongoVoteFindService.getLastDayHotVote(6);
  }

  /**
   * 각 카테고리별 최신 투표를 하나씩 가져옵니다
   * @author 현웅
   */
  @Public()
  @Get("category")
  async getRecentCategoryVotes() {
    return await this.mongoVoteFindService.getRecentCategoryVotes();
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("newer/:voteId")
  async getNewerVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getNewerVotes(voteId);
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 20개를 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("older/:voteId")
  async getOlderVotes(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getOlderVotes(voteId);
  }

  /**
   * 요청한 유저가 더 예전에 업로드한 투표를 20개 찾고 반환합니다
   * @author 현웅
   */
  @Get("uploaded/older/:voteId")
  async getOlderUploadedVotes(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    return await this.mongoVoteFindService.getOlderUploadedVotes({
      userId: req.user.userId,
      voteId,
    });
  }

  /**
   * _id로 특정 투표를 가져옵니다.
   * 존재하지 않는 경우 404 에러를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get(":voteId")
  async getVoteById(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getVoteById(voteId);
  }

  /**
   * 특정 투표의 (대)댓글을 모두 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get(":voteId/comments")
  async getVoteComments(@Param("voteId") voteId: string) {
    return await this.mongoVoteFindService.getVoteComments(voteId);
  }

  /**
   * 특정 투표에 대한 요청 유저의 참여 정보를 가져옵니다.
   * @author 현웅
   */
  @Get(":voteId/participation")
  async getUserVoteParticipation(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
  ) {
    return await this.mongoVoteFindService.getVoteParticipation({
      userId: req.user.userId,
      voteId,
    });
  }
}
