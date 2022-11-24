import { Status400Exception } from "./Status";

/**
 * 아임포트 서버에서 문제가 일어났을 때 사용하는 에러입니다.
 * @author 현웅
 */
export class UnableToConnectIamportException extends Status400Exception {
  constructor() {
    super({ customMessage: "결제대행사 서버에 문제가 발생하였습니다." });
  }
}

/**
 * 클라이언트 단에서 전송한 결제 정보가 DB 정보와 일치하지 않는 경우 사용합니다.
 * @author 현웅
 */
export class InvalidPaymentException extends Status400Exception {
  constructor() {
    super({ customMessage: "유효하지 않은 결제입니다" });
  }
}
