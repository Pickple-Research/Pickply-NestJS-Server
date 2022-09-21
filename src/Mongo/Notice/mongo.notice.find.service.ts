import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notice, NoticeDocument } from "src/Schema";

@Injectable()
export class MongoNoticeFindService {
  constructor(
    @InjectModel(Notice.name) private readonly Notice: Model<NoticeDocument>,
  ) {}

  /**
   * 모든 공지사항을 가져옵니다.
   * @author 현웅
   */
  async getAllNotices() {
    return await this.Notice.find({
      hidden: false, // 숨기지 않은 공지사항 중
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 최신 공지사항을 가져옵니다. 인자가 주어지지 않으면 20개를 가져옵니다.
   * @author 현웅
   */
  async getRecentNotices(limit: number = 20) {
    return await this.Notice.find({
      hidden: false, // 숨기지 않은 공지사항 중
    })
      .limit(limit)
      .sort({ _id: -1 }) // 최신순 정렬 후
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 공지사항 _id을 기준으로 하여 과거의 공지사항 20개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderNotices(noticeId: string, limit: number = 20) {
    return await this.Notice.find({
      hidden: false, // 숨기지 않은 공지사항 중
      _id: { $lt: noticeId }, // 주어진 noticeId 보다 먼저 업로드된 공지사항 중에서
    })
      .limit(limit) // 20개를 가져오고
      .sort({ _id: -1 }) // 최신순 정렬 후
      .lean(); // data만 뽑아서 반환
  }
}
