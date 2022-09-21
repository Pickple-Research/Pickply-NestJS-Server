import { Injectable, Inject } from "@nestjs/common";
import { MongoVoteFindService } from "../../Mongo";

@Injectable()
export class VoteFindService {
  constructor() {}

  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testVoteRouter() {
    return "testVoteRouter";
  }
}
