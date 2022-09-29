import { Controller, Inject, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "src/Security/Metadata";
import {
  MongoNoticeFindService,
  MongoResearchFindService,
  MongoVoteFindService,
} from "src/Mongo";

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
    return "2022-09-29 1907 v1.1.7\n\n - (관리자 API) 크레딧이 분배되지 않은 리서치 일괄 분배 API 추가\n - 유저 스키마 credit 속성 복구\n - 익명 투표 대댓글 넘버링 로직 수정";
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
      service: {
        SERVICE_TERMS:
          "https://docs.google.com/document/d/e/2PACX-1vRODbIfrzgcjFLgTRfN3Gtkjlb_t8XW2eBPK-8ANFTyoRFhbOrAYzx6mTY7nSYq5Q/pub?embedded=true",
        PRIVACY_TERMS:
          "https://docs.google.com/document/d/e/2PACX-1vQ9pknYh_aZVLQZNuAydAqAgLXQIaPqjIWvMaVw77TSwB_LEi3U31OAGLkdZEM8tA/pub?embedded=true",
        info: {
          companyName: "(주)알투씨컴퍼니",
          representative: "김동호",
          personalInformationProtectionOfficer: "김동호",
          address:
            "서울특별시 서대문구 연세로2다길 11-3, 203호 (청년창업꿈터 A동)",
          registrationNumber: "479-88-02430",
        },
      },
      research: {
        RESEARCH_PULLUP_CREDIT: 1,
      },
      vote: {},
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
    const getHotVotes = this.mongoVoteFindService.getHotVotes();
    const getRecentCategoryVotes =
      this.mongoVoteFindService.getRecentCategoryVotes();

    return await Promise.all([
      getNotices,
      getResearches,
      getRecommendResearches,
      getVotes,
      getHotVotes,
      getRecentCategoryVotes,
    ]).then(
      ([
        notices,
        researches,
        recommendResearches,
        votes,
        hotVotes,
        recentCategoryVotes,
      ]) => {
        return {
          notices,
          researches,
          recommendResearches,
          votes,
          hotVotes,
          recentCategoryVotes,
        };
      },
    );
  }
}
