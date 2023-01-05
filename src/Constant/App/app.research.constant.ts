import { EnumValueWithName } from "src/Object/Type";

/** 리서치 끌올에 필요한 크레딧 (서버에서도 사용됩니다) */
export const RESEARCH_PULLUP_CREDIT = 1;

/**
 * 구글 독스의 참여 완료 페이지를 디텍팅하고 신호를 보내는 JS코드입니다.
 * @author 현웅
 */
const googleDocsCompleteDetector = `
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
const naverDocsCompleteDetector = `
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
const moaFormCompleteDetector = `
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

type ResearchForm = {
  formName: string;
  baseURLs: string[];
  injectedJS: string;
  closedURLs: string[];
};

/** @deprecated */
type ResearchFoam = {
  foamName: string;
  baseURLs: string[];
  injectedJS: string;
  closedURLs: string[];
};

/**
 * 서버에서 동기화하는 리서치 관련 상수 타입
 * @author 현웅
 */
type ResearchConstant = {
  RESEARCH_PULLUP_CREDIT: number; // 리서치 끌올에 필요한 크레딧
  forms: ResearchForm[]; // 리서치에서 허용하는 폼
  researchTypes: EnumValueWithName[]; // 리서치 타입(유형)
  researchPurposes: EnumValueWithName[]; // 리서치 진행 목적
  researchCategories: EnumValueWithName[]; // 리서치 카테고리

  /** @deprecated #DELETE-AT-YEAR-END */
  foamDatas: ResearchFoam[];
};

/**
 * 앱에서 사용되는 리서치 상수 중, 서버와 동기화되는 부분입니다.
 * @author 현웅
 */
export const appResearchConstant: ResearchConstant = {
  RESEARCH_PULLUP_CREDIT: RESEARCH_PULLUP_CREDIT,
  forms: [
    {
      formName: "구글폼",
      baseURLs: ["https://forms.gle", "https://docs.google.com"],
      injectedJS: googleDocsCompleteDetector,
      closedURLs: ["/closedform"],
    },
    {
      formName: "네이버폼",
      baseURLs: ["https://naver.me", "https://form.office.naver.com"],
      injectedJS: naverDocsCompleteDetector,
      closedURLs: [],
    },
    {
      formName: "모아폼",
      baseURLs: ["https://moaform.com", "https://surveyl.ink"],
      injectedJS: moaFormCompleteDetector,
      closedURLs: ["/closed", "/not_found"],
    },
  ],
  researchTypes: [],
  researchPurposes: [],
  researchCategories: [],

  //#DELETE-AT-YEAR-END
  foamDatas: [
    {
      foamName: "구글폼",
      baseURLs: ["https://forms.gle", "https://docs.google.com"],
      injectedJS: googleDocsCompleteDetector,
      closedURLs: ["/closedform"],
    },
    {
      foamName: "네이버폼",
      baseURLs: ["https://naver.me", "https://form.office.naver.com"],
      injectedJS: naverDocsCompleteDetector,
      closedURLs: [],
    },
    {
      foamName: "모아폼",
      baseURLs: ["https://moaform.com", "https://surveyl.ink"],
      injectedJS: moaFormCompleteDetector,
      closedURLs: ["/closed", "/not_found"],
    },
  ],
};
