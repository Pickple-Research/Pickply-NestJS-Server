import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { MongoError } from "mongodb";

/**
 * @deprecated all.exception.filter.ts에서 모든 에러를 관리합니다.
 *
 * @description MongoError가 발생했을 때의 처리 방식을 지정합니다.
 * @author 현웅
 */
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: MongoError, host: ArgumentsHost): void {
    console.error(exception.name);
    console.error(exception.message);

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const responseBody = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, 500);
  }
}
