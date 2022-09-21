import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportLocalStrategy } from "passport-local";

/**
 * email과 password를 이용한 로그인에 사용되는 Strategy를 정의합니다.
 * (실제로 사용하고 있지는 않습니다. 참고용임)
 *
 * passport-local 라이브러리에서 import하여 사용하는 Strategy는 기본적으로
 * request body에 username:string, password:string 속성이 존재하는 것을 전제로 하며,
 * 해당 속성이 존재하지 않으면 validate() 함수를 거치지 않고 401 status code를 반환합니다.
 *
 * username, password 속성의 이름을 바꾸고 싶다면 super()에
 * {usernameField:'<field name>', passwordField:'<field name>'} 형태의 인자를 넣어 설정해야 합니다.
 *
 * @see http://www.passportjs.org/concepts/authentication/strategies (공식문서)
 * @see https://docs.nestjs.com/security/authentication (예시)
 * @author 현웅
 */
@Injectable()
export class EmailAuthStrategy extends PassportStrategy(
  PassportLocalStrategy,
  "email auth",
) {
  constructor() {
    super({ usernameField: "email" });
  }

  async validate(): Promise<any> {
    console.log("local strategy property confirmed");

    return true;
  }
}
