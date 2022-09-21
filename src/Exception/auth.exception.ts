import { Status400Exception, Status401Exception } from "./Status";

/**
 * 이메일 전송에 실패한 경우
 * @author 현웅
 */
export class EmailTransmitFailedException extends Status401Exception {
  constructor() {
    super({ customMessage: "이메일 전송에 실패했습니다" });
  }
}

/**
 * 중복된 이메일로 회원가입을 시도하는 경우 사용합니다.
 * 기본 message: '이미 사용 중인 이메일입니다'
 * @author 현웅
 */
export class EmailDuplicateException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `이미 사용 중인 이메일입니다`,
    });
  }
}

/**
 * 중복된 닉네임으로 회원가입을 시도하는 경우 사용합니다.
 * 기본 message: '이미 사용 중인 닉네임입니다'
 * @author 현웅
 */
export class NicknameDuplicateException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `이미 사용 중인 닉네임입니다`,
    });
  }
}

/**
 * 주어진 인증번호가 미인증 유저의 인증번호와 일치하지 않는 경우 사용합니다.
 * 기본 message: `인증번호가 일치하지 않습니다`
 * @author 현웅
 */
export class WrongAuthorizationCodeException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `인증번호가 일치하지 않습니다`,
    });
  }
}

/**
 * 인증번호가 만료된 후 인증을 시도하는 경우 경우 사용합니다.
 * 기본 message: `인증번호가 만료되었습니다.\n새로운 인증번호를 발급받아주세요`
 * @author 현웅
 */
export class AuthCodeExpiredException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : `인증번호가 만료되었습니다.\n새로운 인증번호를 발급받아주세요`,
    });
  }
}

/**
 * 이메일 회원가입을 진행하기 전에 해당 이메일이 인증된 상태인지 확인합니다.
 * 기본 message: `이메일이 인증되지 않았습니다`
 * @author 현웅
 */
export class EmailNotAuthorizedException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `이메일이 인증되지 않았습니다`,
    });
  }
}

/**
 * (로그인 시) 비밀번호가 일치하지 않는 경우 사용합니다.
 * 기본 message: `비밀번호가 일치하지 않습니다`
 * @author 현웅
 */
export class WrongPasswordException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : `비밀번호가 일치하지 않습니다`,
    });
  }
}

/**
 * 비밀번호 재설정 시도 시, 이메일 인증이 이루어지지 않은 경우 사용합니다.
 * 기본 message: `이메일 인증이 이뤄지지 않았습니다`
 * @author 현웅
 */
export class EmailNotVerifiedException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : `이메일 인증이 이뤄지지 않았습니다`,
    });
  }
}

/**
 * Jwt가 만료되었거나 잘못된 형식인 경우 사용합니다.
 * 기본 message: `토큰이 만료되었거나 올바르지 않습니다`
 * @author 현웅
 */
export class InvalidJwtException extends Status401Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : `토큰이 만료되었거나 올바르지 않습니다`,
    });
  }
}
