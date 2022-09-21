import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC } from "src/Security/Metadata";

/**
 * Jwt를 검증하는 Guard입니다.
 * ./security.strategy.ts 파일의 JwtStrategy를 사용합니다.
 * 단, @Public() 데코레이터가 있는 요청은 통과시킵니다.
 *
 * guard.module.ts#GuardModule에서 import 되며,
 * GuardModule이 AppModule에 import 되면서 최종적으로 앱에 적용됩니다.
 * (전역적으로 적용되는 이유는 guard.module에서 provide: APP_GUARD 옵션을 추기 때문입니다.
 *   자세한 내용은 아래 공식 문서를 참조하세요.)
 *
 * @see https://docs.nestjs.com/security/authentication#enable-authentication-globally
 * @author 현웅
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt auth") {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 해당 Controller를 실행할지 여부를 true, false로 반환합니다.
   * true
   * @author 현웅
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //* 호출되는 Controller의 함수의 메타데이터에 IS_PUBLIC 값이 설정되어있는지 확인합니다.
    //* (@Public() 데코레이터가 있는 경우 true로 설정됩니다.)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    //* isPublic 값이 true로 설정되어 있다면 Strategy를 거치지 않고 통과시킵니다
    if (isPublic) return true;

    return super.canActivate(context);
  }

  // /**
  //  * Jwt가 유효하지 않을 때의 Exception을 커스텀하기 위한 함수
  //  * @see https://stackoverflow.com/questions/60042350/customise-the-response-on-verification-failure-for-a-jwt-strategy-nestjs
  //  * @author 현웅
  //  */
  // handleRequest<TUser = any>(
  //   err: any,
  //   user: any,
  //   info: any,
  //   context: any,
  //   status?: any,
  // ): TUser {
  //   if (info instanceof JsonWebTokenError) {
  //     throw new InvalidJwtException();
  //   }
  //   return super.handleRequest(err, user, info, context, status);
  // }
}
