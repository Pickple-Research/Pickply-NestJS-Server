import { Injectable, Inject } from "@nestjs/common";
import { MongoResearchFindService } from "src/Mongo";

@Injectable()
export class ResearchFindService {
  constructor() {}

  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;

  /**
   * 마감일이 존재하면서 마감되지 않은 모든 리서치 정보를 가져옵니다.
   * @author 현웅
   */
  async getAllOpenedResearchWithDeadline() {
    return await this.mongoResearchFindService.getAllOpenedResearchWithDeadline();
  }
}
