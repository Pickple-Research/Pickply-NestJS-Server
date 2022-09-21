import { Controller, Inject, Param, Get } from "@nestjs/common";
import { MongoNoticeFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";

@Controller("notices")
export class NoticeGetController {
  constructor() {}

  @Inject() private readonly mongoNoticeFindService: MongoNoticeFindService;

  /**
   * 최신 공지사항을 20개 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("")
  async getRecentNotices() {
    return await this.mongoNoticeFindService.getRecentNotices();
  }

  /**
   * 주어진 공지사항 _id 를 기준으로 하여 더 과거의 공지사항을 20개 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("older/:noticeId")
  async getOlderNotices(@Param("noticeId") noticeId: string) {
    return await this.mongoNoticeFindService.getOlderNotices(noticeId);
  }
}
