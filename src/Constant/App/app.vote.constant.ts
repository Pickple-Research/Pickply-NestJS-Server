import { VoteCategory } from "src/Object/Enum";
import { EnumValueWithName } from "src/Object/Type";

/**
 * @AppSync
 * 투표 관련 상수 타입
 * @author 현웅
 */
type VoteConstant = {
  voteCategories: EnumValueWithName[];
};

export const appVoteConstant: VoteConstant = {
  voteCategories: [
    { value: VoteCategory.GREEN_LIGHT, displayName: "연애" },
    { value: VoteCategory.COORDI, displayName: "패션/뷰티" },
    { value: VoteCategory.ISSUE, displayName: "이슈/트렌드" },
    { value: VoteCategory.SPORTS, displayName: "스포츠" },
    { value: VoteCategory.STARTUP, displayName: "창업/스타트업" },
    { value: VoteCategory.UNIV_STUDENT, displayName: "대학생" },
    { value: VoteCategory.POST_GRAD_STUDENT, displayName: "대학원생" },
    { value: VoteCategory.OFFICE_WORKER, displayName: "직장인" },
    { value: VoteCategory.ETC, displayName: "기타" },
  ],
};
