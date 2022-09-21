import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomExceptionResonse } from "../Status";

/**
 * @deprecated all.exception.filter.ts에서 모든 에러를 관리합니다.
 *
 * @description HttpException이 발생했을 때의 처리 방식을 지정합니다.
 * @author 현웅
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  //TODO: Http Exception 이외의 에러 핸들링 추가
  //? argumentsHost: handler에게 전달된 모든 arguments들을 가지고 있는 객체. (req, res, next 등)
  //?     getArgs(), getArgByIndex(), getType() 등의 함수를 사용하여 요청에 담긴 정보들을 읽어낼 수 있음.
  catch(exception: HttpException, argumentsHost: ArgumentsHost) {
    const httpArgumentsHost = argumentsHost.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();
    const status = exception.getStatus();

    //TODO: 어떤 유저가 요청했는지도 추가
    const user = request.user;
    const exceptionResponse = exception.getResponse() as CustomExceptionResonse;
    console.error(
      `FAILED(${status}): [${request.method}] ${request.url} ${exception.name}`,
    );

    response.status(status).json({
      statusCode: status,
      path: request.url,
      response: exception.getResponse() as CustomExceptionResonse,
    });
  }
}
