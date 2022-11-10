import { Controller, Inject, Get } from "@nestjs/common";
import { Public } from "src/Security/Metadata";
import {
  MongoNoticeFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";

/**
 * 관리자용 앱 관련 Get 컨트롤러입니다.
 */
@Controller("admin")
export class AdminAppController {
  constructor() {}

  @Inject() private readonly mongoNoticeFindService: MongoNoticeFindService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject() private readonly mongoVoteFindService: MongoVoteFindService;

  /**
   * 관리자용 앱에서만 사용되는 상수들을 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("constants")
  async getAdminConstants() {
    return {
      user: {
        creditHistoryPresets: [
          {
            reason: "[스타벅스] 카페 아메리카노T",
            type: "PRODUCT_EXCHANGE",
            scale: -50,
          },
          {
            reason: "[네이버페이] 5천원권",
            type: "PRODUCT_EXCHANGE",
            scale: -60,
          },
          {
            reason: "[네이버페이] 1만원권",
            type: "PRODUCT_EXCHANGE",
            scale: -100,
          },
          {
            reason: "(관리자) 리서치 업로드 크레딧 지원",
            type: "ETC",
            scale: -100,
          },
        ],
      },
    };
  }

  /**
   * 앱을 처음 시작할 때 호출합니다.
   * 모든 공지사항, 최신 리서치, 추천 리서치, 최신 투표, HOT 투표, 카테고리별 최신 투표를 가져옵니다.
   * 일반 bootstrap 과 다르게 hidden, blocked, confirmed 되지 않은 리서치와 투표도 모두 가져옵니다.
   * (추천 / 고정 / 카테고리별 콘텐츠는 제외)
   * @author 현웅
   */
  @Public()
  @Get("bootstrap")
  async adminBootstrap() {
    const getNotices = this.mongoNoticeFindService.getAllNotices();
    const getResearches = this.mongoResearchFindService.getResearches({
      limit: 20,
    });
    const getRecommendResearches =
      this.mongoResearchFindService.getRecommendResearches();
    const getVotes = this.mongoVoteFindService.getVotes({ limit: 20 });
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
