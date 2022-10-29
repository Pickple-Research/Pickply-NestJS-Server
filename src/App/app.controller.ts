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
    return "2022-10-29 1854 v1.1.14";
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

  /**
   * 구글 독스의 참여 완료 페이지를 디텍팅하고 신호를 보내는 JS코드입니다.
   * @author 현웅
   */
  private readonly googleDocsCompleteDetector = `
    const bodyDivs = [...document.querySelectorAll('body > div')];
    //* body 의 직계 div 가 2개고
    if(bodyDivs.length === 2) {
      //* 그 중 두번째 div 가 jscontroller 속성을 가지고 있으며
      if(bodyDivs[1].hasAttribute('jscontroller')){
        //* 해당 div 의 하위 구성 요소가 없을 때 완료 처리
        if(!bodyDivs[1].hasChildNodes()){
          window.ReactNativeWebView.postMessage('formSubmitted');
        }
      }
      //! if 문 내부에서 || 를 사용하거나 return; 을 사용하면 iOS 가 못 잡아냅니다 (...ㅎ)
      // if(bodyDivs[1].hasAttribute('jscontroller')){
      //   window.ReactNativeWebView.postMessage('formSubmitted');
      //   return;
      // }
      // if(bodyDivs[1].hasAttribute('jsnamespace')){
      //   window.ReactNativeWebView.postMessage('formSubmitted');
      //   return;
      // }
    }
  `;

  /**
   * 네이버 폼의 참여 완료 페이지를 디텍팅하고 신호를 보내는 JS코드입니다.
   * 이 때, finishInfoPh 와 dateBox 가 동시에 보이는 경우는 네이버폼이 닫혀있다는 의미이므로
   * (이 경우, 결과창에서 마감일이 같이 보여집니다. 정상적인 경우엔 보이지 않음.)
   * formSubmitted 대신 formClosed 신호를 보냅니다.
   * @author 현웅
   */
  private readonly naverDocsCompleteDetector = `
    const dateBox = document.getElementsByClassName('date')[0];
    const finishInfo = document.getElementsByClassName('finishInfoPh')[0];
    //* 완료 페이지가 나타났고
    if(window.getComputedStyle(finishInfo).display !== 'none') {
      //* 마감일이 같이 보여지는 경우 (마감일이 경과하였음. 즉, 네이버폼 자체적인 마감)
      if(window.getComputedStyle(dateBox).display !== 'none') {
        window.ReactNativeWebView.postMessage('formClosed');
      } else {
        window.ReactNativeWebView.postMessage('formSubmitted');
      }
    }
  `;

  /**
   * 모아폼의 참여 완료 페이지를 디텍팅하고 신호를 보내는 JS코드입니다.
   * @author 현웅
   */
  private readonly moaFoamCompleteDetector = `
    const answerBox = document.getElementById('js-answer-cover');
    if(answerBox) {
      window.ReactNativeWebView.postMessage('formSubmitted');
      //* 아래처럼 응답 도중에 마감된 폼을 잡아낼 수도 있지만, 사용하진 않습니다.
      //* 일단 한번 설문에 진입하면 끝까지 진행할 수 있게 합니다.
      // const closedBox = document.getElementByClassName('answer-closed');
      // if(closedBox.length > 0) {
      //   window.ReactNativeWebView.postMessage('formClosed');
      // } else {
      //   window.ReactNativeWebView.postMessage('formSubmitted');
      // }
    }
  `;
}
