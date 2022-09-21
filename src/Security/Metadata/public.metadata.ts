import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "isPublic";
/**
 * 커스텀 데코레이터 @Public()을 정의합니다.
 * 해당 데코레이터가 붙은 요청 함수에는 IS_PUBLIC 메타데이터 값이 true로 성정되며,
 * JwtStrategy 조건을 만족하지 않고도 JwtGuard를 통과합니다.
 * (jwtAuth.guard.ts 참고)
 * @author 현웅
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
