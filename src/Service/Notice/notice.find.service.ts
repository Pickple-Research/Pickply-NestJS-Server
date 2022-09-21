import { Injectable, Inject } from "@nestjs/common";
import { MongoNoticeFindService } from "../../Mongo";

@Injectable()
export class NoticeFindService {
  constructor() {}

  @Inject() private readonly mongoNoticeFindService: MongoNoticeFindService;

  /**
   * @Get
   * 테스트 라우터
   * @author 현웅
   */
  async testNoticeRouter() {
    return "testNoticeRouter";
  }
}
