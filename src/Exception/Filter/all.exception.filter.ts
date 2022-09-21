import {
  ExceptionFilter,
  Inject,
  Catch,
  ArgumentsHost,
  HttpException,
  LoggerService,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { MongoError } from "mongodb";
import { CustomExceptionResonse } from "../Status";

/**
 * 에러 발생 시 로그와 응답객체를 관리합니다.
 * @author 현웅
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  //? argumentsHost: handler에게 전달된 모든 arguments들을 가지고 있는 객체. (req, res, next 등)
  //?     getArgs(), getArgByIndex(), getType() 등의 함수를 사용하여 요청에 담긴 정보들을 읽어낼 수 있음.
  catch(exception: any, argumentsHost: ArgumentsHost) {
    //* 로그에 남길 정보 선언
    let exceptionType: string = "OTHER";
    let status: number = 500;
    let code: string | number;
    let responseBody: any = {};

    //* 에러에 대한 정보를 수집하기 위해 request와 response를 추출
    /** @see https://docs.nestjs.com/exception-filters#catch-everything */
    const { httpAdapter } = this.httpAdapterHost;
    const httpArgumentsHost = argumentsHost.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();
    const response = httpArgumentsHost.getResponse<Response>();

    //* /////////////////////////////////////////////////////////////
    //* 로그 정보 구성

    //* Http Exception인 경우
    if (exception instanceof HttpException) {
      exceptionType = "HTTP-EXCEPTION";
      status = exception.getStatus();
      responseBody = exception.getResponse() as CustomExceptionResonse;
    }

    //* Mongo Error인 경우
    //TODO: 대표적인 Mongo Error는 status code 설정
    else if (exception instanceof MongoError) {
      exceptionType = "MONGO-ERROR";
      code = exception.code;
    }

    //* 그 이외의 경우 (최악)
    //* 초기값인 exceptionType="OTHER", status 500을 그대로 활용
    //TODO: status code, message 어떻게?
    else {
    }

    //*
    //* /////////////////////////////////////////////////////////////

    //* 에러 내용 로깅
    this.logger.error(
      `FAILED(${exceptionType}: ${
        exceptionType == "MONGO-ERROR" ? code : status
      }): [${request.method}] ${request.url}\n -> ${exception.name}: ${
        exception.message
      }`,
      [exception.stack],
    );
    // if (exception.stack)
    //   this.logger.error(
    //     `<ERROR STACK>\n${"=".repeat(20)}\n${exception.stack}\n${"=".repeat(
    //       20,
    //     )}`,
    //   );

    //* 사용자에게 응답 반환
    httpAdapter.reply(response, responseBody, status);
  }
}
