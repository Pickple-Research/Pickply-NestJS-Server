import { Controller, Inject, Request, Post, Body } from "@nestjs/common";
import { MongoNoticeCreateService } from "src/Mongo";
import { Notice } from "src/Schema";
import { JwtUserInfo } from "src/Object/Type";
import { NoticeCreateBodyDto } from "src/Dto";
import { getCurrentISOTime } from "src/Util";

@Controller("notices")
export class NoticePostController {
  constructor() {}

  @Inject() private readonly mongoNoticeCreateService: MongoNoticeCreateService;

  /**
   * 새로운 공지를 등록합니다.
   * @return 생성된 공지 데이터
   * @author 현웅
   */
  @Post("")
  async createNotice(
    @Request() req: { user: JwtUserInfo },
    @Body() body: NoticeCreateBodyDto,
  ) {
    const notice: Notice = {
      authorId: req.user.userId,
      authorNickname: req.user.userNickname,
      title: body.title,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };

    return await this.mongoNoticeCreateService.createNotice(notice);
  }
}
