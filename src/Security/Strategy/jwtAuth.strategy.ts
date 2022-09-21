import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportJwtStrategy, ExtractJwt } from "passport-jwt";
import { JwtUserInfo } from "src/Object/Type";

/**
 * Bearer Header에 담긴 Jwt로부터 유저 정보를 추출하는 Strategy입니다.
 * Bearer Header가 없거나, 유효한 Jwt가 아니면 401 에러를 반환합니다.
 * @author 현웅
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  PassportJwtStrategy,
  "jwt auth", // 이곳에서 정의한 Strategy를 Guard에 사용할 때 사용할 이름을 'jwt auth'로 설정합니다
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //TODO: Jwt 만료시간 설정하고 만료된 경우 Access Token으로 갱신 요청 (auth.server.ts의 login() 참조)
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * JwtAuthGuard의 super.canActivate() 함수가 true를 반환하는 경우 호출됩니다.
   *
   * PassportStrategy를 extends하는 class의 경우,
   * constructor에 명시된 조건에 따라 JWT를 JSON 형식으로 바꾼 뒤
   * 해당 정보를 validate() 함수의 단일 인자로 넣어 실행시킵니다.
   *
   * 여기서 return 되는 값은 기본적으로 Request의 user 객체에 담겨 전달됩니다.
   * @see https://docs.nestjs.com/security/authentication#implementing-passport-jwt
   * @author 현웅
   */
  async validate(userInfo: JwtUserInfo) {
    return userInfo;
  }
}
