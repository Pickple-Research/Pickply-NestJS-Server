/**
 * 주어진 문자열이 유효한 이메일 형식인지 확인합니다.
 * @link https://www.abstractapi.com/guides/email-validation-regex-javascript
 * @author 현웅
 */
export function isValidEmail(str: string) {
  return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9_.+-]+\.[a-zA-Z0-9_.+-]+$/.test(str);
}
