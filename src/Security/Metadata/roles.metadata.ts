import { SetMetadata } from "@nestjs/common";

/**
 * @Roles() Guard에 대한 메타 데이터 생성. Admin Module 에서만 사용됩니다.
 * @author 현웅
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
