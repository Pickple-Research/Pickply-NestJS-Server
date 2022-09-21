import { Controller, Inject, Request, Query, Param, Get } from "@nestjs/common";
import { MongoResearchFindService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { Public } from "src/Security/Metadata";
import { ResearchNotFoundException } from "src/Exception";

@Controller("researches")
export class ResearchGetController {
  constructor() {}

  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;

  /**
   * pulledupAt을 기준으로 최신 리서치를 원하는만큼 찾고 반환합니다.
   * get 인자가 주어지지 않은 경우 기본적으로 20개를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("")
  async getRecentResearches(@Query() query: { get?: number }) {
    return await this.mongoResearchFindService.getRecentResearches(query?.get);
  }

  /**
   * 추천 리서치를 반환합니다
   * @author 현웅
   */
  @Public()
  @Get("recommend")
  async getRecommendResearches() {
    return await this.mongoResearchFindService.getRecommendResearches();
  }

  /**
   * 주어진 리서치 pulledupAt 을 기준으로 하여 더 최근의 리서치 모두 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("newer/:pulledupAt")
  async getNewerResearches(@Param("pulledupAt") pulledupAt: string) {
    return await this.mongoResearchFindService.getNewerResearches(pulledupAt);
  }

  /**
   * 주어진 리서치 pulledupAt 을 기준으로 하여 과거의 리서치 20개를 찾고 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("older/:pulledupAt")
  async getOlderResearches(@Param("pulledupAt") pulledupAt: string) {
    return await this.mongoResearchFindService.getOlderResearches(pulledupAt);
  }

  /**
   * 더 예전에 업로드한 리서치를 20개 찾고 반환합니다
   * @author 현웅
   */
  @Get("uploaded/older/:pulledupAt")
  async getOlderUploadedResearches(
    @Request() req: { user: JwtUserInfo },
    @Param("pulledupAt") pulledupAt: string,
  ) {
    return await this.mongoResearchFindService.getOlderUploadedResearches({
      userId: req.user.userId,
      pulledupAt,
    });
  }

  /**
   * _id로 특정 리서치를 찾고 반환합니다.
   * 존재하지 않는 경우 404 에러를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get(":researchId")
  async getResearchById(@Param("researchId") researchId: string) {
    const research = await this.mongoResearchFindService.getResearchById({
      researchId,
    });

    if (!research) throw new ResearchNotFoundException();
    return research;
  }

  /**
   * 리서치 댓글을 모두 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get(":researchId/comments")
  async getResearchComments(@Param("researchId") researchId: string) {
    return await this.mongoResearchFindService.getResearchComments(researchId);
  }
}
