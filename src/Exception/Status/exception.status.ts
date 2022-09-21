import { HttpStatus, HttpException } from "@nestjs/common";

/**
 * Custom Exception에 추가로 담을 정보 형태를 지정합니다.
 * @author 현웅
 */
export type CustomExceptionResonse = {
  customMessage: string;
};

export class Status400Exception extends HttpException {
  constructor(customMessage: CustomExceptionResonse) {
    super(customMessage, HttpStatus.BAD_REQUEST);
  }
}

export class Status401Exception extends HttpException {
  constructor(customMessage: CustomExceptionResonse) {
    super(customMessage, HttpStatus.UNAUTHORIZED);
  }
}

export class Status403Exception extends HttpException {
  constructor(customMessage: CustomExceptionResonse) {
    super(customMessage, HttpStatus.FORBIDDEN);
  }
}

export class Status404Exception extends HttpException {
  constructor(customMessage: CustomExceptionResonse) {
    super(customMessage, HttpStatus.NOT_FOUND);
  }
}

export class Status500Exception extends HttpException {
  constructor(customMessage: CustomExceptionResonse) {
    super(customMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
