type Event = {
  title?: string;
  content?: string;
  detail?: string;
  researchId?: string;
  voteId?: string;
  target?: "ALL" | "USER" | "NON-MEMBER";
};

/**
 * @AppSync
 * 앱 서비스 상수
 * @author 현웅
 */
export type ServiceConstants = {
  APP_RECENT_VERSION: {
    version: string;
    forceUpdate: boolean;
    updateList?: string[];
  };

  CONTACT_EMAIL: string;
  WEB_SERVICE_URL: string;
  GOOGLE_PLAY_STORE_URL: string;
  APPLE_APP_STORE_URL: string;
  KAKAO_CHAT_URL: string;

  SERVICE_TERMS: string;
  PRIVACY_TERMS: string;

  event: Event;
};

/**
 * 모바일 앱에서 사용되는 상수들입니다.
 * @author 현웅
 */
export const appServiceConstant: ServiceConstants = {
  APP_RECENT_VERSION: {
    version: "1.1.16",
    forceUpdate: false,
    updateList: [],
  },

  CONTACT_EMAIL: "contact@r2c.company",
  WEB_SERVICE_URL: "https://pickply.com",
  GOOGLE_PLAY_STORE_URL:
    "https://play.google.com/store/apps/details?id=com.pickpleresearch&hl=ko",
  APPLE_APP_STORE_URL: "https://apps.apple.com/kr/app/pickply/id1640390682",

  KAKAO_CHAT_URL: "http://pf.kakao.com/_xkDElxj/chat",

  SERVICE_TERMS:
    "https://docs.google.com/document/d/e/2PACX-1vRODbIfrzgcjFLgTRfN3Gtkjlb_t8XW2eBPK-8ANFTyoRFhbOrAYzx6mTY7nSYq5Q/pub?embedded=true",
  PRIVACY_TERMS:
    "https://docs.google.com/document/d/e/2PACX-1vQ9pknYh_aZVLQZNuAydAqAgLXQIaPqjIWvMaVw77TSwB_LEi3U31OAGLkdZEM8tA/pub?embedded=true",

  event: {},
};
