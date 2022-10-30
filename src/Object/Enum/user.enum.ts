/**
 * 유저 성별
 * @author 현웅
 */
export enum Gender {
  UNDEFINED = "UNDEFINED",
  MALE = "MALE",
  FEMALE = "FEMALE",
}

/**
 * 유저 타입: 일반 사용자, 테스터, 관리자
 * @author 현웅
 */
export enum UserType {
  USER = "USER",
  TESTER = "TESTER",
  PARTNER = "PARTNER",
  ADMIN = "ADMIN",
}

/**
 * 계정 타입: 회원가입 방식
 * @author 현웅
 */
export enum AccountType {
  EMAIL = "EMAIL",
  KAKAO = "KAKAO",
  GOOGLE = "GOOGLE",
  NAVER = "NAVER",
}

/**
 * @AppSync
 * 크레딧 변동 사유
 * @author 현웅
 */
export enum CreditHistoryType {
  // 회원가입 유도 이벤트
  SIGNUP_EVENT = "SIGNUP_EVENT",
  // 리서치 참여
  RESEARCH_PARTICIPATE = "RESEARCH_PARTICIPATE",
  // 삭제된 리서치에 참여
  DELETED_RESEARCH_PARTICIPATE = "DELETED_RESEARCH_PARTICIPATE",
  // 리서치 업로드
  RESEARCH_UPLOAD = "RESEARCH_UPLOAD",
  // 리서치 수정
  RESEARCH_EDIT = "RESEARCH_EDIT",
  // 리서치 끌올
  RESEARCH_PULLUP = "RESEARCH_PULLUP",
  // 리서치 추가 증정 크레딧 당첨
  WIN_RESEARCH_EXTRA_CREDIT = "WIN_RESEARCH_EXTRA_CREDIT",
  // 리서치 크레딧 차액 보상
  CREDIT_COMPENSATION = "CREDIT_COMPENSATION",
  // 투표 참여 없이 투표 결과 통계 조회
  INQUIRE_VOTE_STAT = "INQUIRE_VOTE_STAT",
  // 크레딧을 통한 경품 교환
  PRODUCT_EXCHANGE = "PRODUCT_EXCHANGE",
  // SurBay 사용자 기존 크레딧 이관
  MIGRATE = "MIGRATE",
  // 기타
  ETC = "ETC",
}
