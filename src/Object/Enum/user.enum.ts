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
 * 크레딧 변동 사유
 * @author 현웅
 */
export enum CreditHistoryType {
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
  // SurBay 사용자 기존 크레딧 이관
  MIGRATE = "MIGRATE",
}
