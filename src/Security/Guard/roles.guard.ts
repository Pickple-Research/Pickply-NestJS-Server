import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * userType을 검증하는 Guard입니다.
 * 요청에 @Roles() 데코레이터가 붙어있으면
 * JWT 파싱을 통해 Request 에 넘겨온 user 의 userType 검사합니다.
 * @author 승원
 * @modify 현웅
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());

    //* @Roles 데코레이터가 명시되어 있지 않은 요청은 모두 통과합니다.
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    //* request 에서 user 정보를 추출
    const { user } = request;
    //* user 의 userType 이 @Roles 데코레이터에 명시된 경우 통과
    return user && roles.includes(user.userType);
  }
}
