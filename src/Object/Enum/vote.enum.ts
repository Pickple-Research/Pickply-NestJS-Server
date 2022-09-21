/**
 * 투표 카테고리 종류
 * @author 현웅
 */
export enum VoteCategory {
  GREEN_LIGHT = "GREEN_LIGHT",
  COORDI = "COORDI",
  UNIV_STUDENT = "UNIV_STUDENT",
  POST_GRAD_STUDENT = "POST_GRAD_STUDENT",
  STARTUP = "STARTUP",
  ETC = "ETC",
}

export const AllVoteCategory: VoteCategory[] = [
  VoteCategory.GREEN_LIGHT,
  VoteCategory.COORDI,
  VoteCategory.UNIV_STUDENT,
  VoteCategory.POST_GRAD_STUDENT,
  VoteCategory.STARTUP,
  VoteCategory.ETC,
];
