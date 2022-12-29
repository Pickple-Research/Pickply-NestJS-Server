import { Controller, Inject, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "src/Security/Metadata";
import {
  MongoNoticeFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";
import {
  appCompanyConstants,
  appResearchConstant,
  appServiceConstant,
  appVoteConstant,
} from "src/Constant/App";

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject() private readonly mongoNoticeFindService: MongoNoticeFindService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 배포 시 테스트 URL입니다.
   * @author 현웅
   */
  @Public()
  @Get("release")
  async test() {
    return "2022-12-29 1045 v1.1.23";
  }

  /**
   * 서버 헬스체크용 경로입니다.
   * @author 현웅
   */
  @Public()
  @Get("health")
  async healthCheck() {
    return await this.appService.healthCheck();
  }

  /**
   * 앱에서 사용되는 상수 중 서버에서 동적으로 변경할 수 있는 상수를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("constants")
  async appConstant() {
    return {
      service: appServiceConstant,
      research: appResearchConstant,
      vote: appVoteConstant,
      company: appCompanyConstants,
    };
  }

  /**
   * 앱을 처음 시작할 때 호출합니다.
   * 모든 공지사항, 최신 리서치, 추천 리서치, 최신 투표, HOT 투표, 카테고리별 최신 투표를 가져옵니다.
   * @author 현웅
   */
  @Public()
  @Get("bootstrap")
  async bootstrap() {
    const getNotices = this.mongoNoticeFindService.getAllNotices();
    const getResearches = this.mongoResearchFindService.getRecentResearches();
    const getRecommendResearches =
      this.mongoResearchFindService.getRecommendResearches();
    const getVotes = this.mongoVoteFindService.getRecentVotes();
    const getFixedVotes = this.mongoVoteFindService.getFixedVotes();
    const getHotVotes = this.mongoVoteFindService.getHotVotes();
    const getRecentCategoryVotes =
      this.mongoVoteFindService.getRecentCategoryVotes();

    return await Promise.all([
      getNotices,
      getResearches,
      getRecommendResearches,
      getVotes,
      getFixedVotes,
      getHotVotes,
      getRecentCategoryVotes,
    ]).then(
      ([
        notices,
        researches,
        recommendResearches,
        votes,
        fixedVotes,
        hotVotes,
        recentCategoryVotes,
      ]) => {
        return {
          notices,
          researches,
          recommendResearches,
          votes,
          fixedVotes,
          hotVotes,
          recentCategoryVotes,
        };
      },
    );
  }
}
