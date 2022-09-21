import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notice, NoticeDocument } from "src/Schema";

@Injectable()
export class MongoNoticeCreateService {
  constructor(
    @InjectModel(Notice.name) private readonly Notice: Model<NoticeDocument>,
  ) {}

  /**
   * 새로운 공지를 등록합니다
   * @return 새로운 공지 데이터
   * @author 현웅
   */
  async createNotice(notice: Notice) {
    const newNotices = await this.Notice.create([notice]);
    return newNotices[0].toObject();
  }
}
