/**
 * 요청에 따른 변수 구성이 올바른지 확인하는 Dto를 정의합니다.
 * (Controller단에서만 사용됩니다)
 * DTO class를 정의하는 자세한 내용은 class-validator를 참고하세요.
 * @author 현웅
 */

export * from "./Admin/admin.patch.dto";

export * from "./auth.dto";
export * from "./notice.dto";
export * from "./partner.dto";

export * from "./Research/research.patch.dto";
export * from "./Research/research.post.dto";

export * from "./user.dto";
export * from "./User/user.patch.dto";

export * from "./Vote/vote.patch.dto";
export * from "./Vote/vote.post.dto";
