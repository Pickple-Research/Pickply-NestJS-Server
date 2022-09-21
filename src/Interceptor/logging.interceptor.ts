import {
  Injectable,
  Inject,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  LoggerService,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { CustomExceptionResonse } from "src/Exception/Status";
import { healthCheckUrl } from "src/Constant";

/**
 * 성공한 모든 요청에 대해 로그를 남기는 인터셉터입니다. 로그는 아래 내용을 포함합니다:
 * - 요청 처리 소요 시간
 * - HTTP method
 * - request path
 * @author 현웅
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  //? ExecutionContext: ArgumentsHost를 상속받고 기능이 추가된 클래스입니다.
  //?     ArgumentsHost에 대해선 exception.filter.ts 파일을 참고하세요.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //* Request 객체 저장
    const httpArgs = context.switchToHttp();
    const req = httpArgs.getRequest<Request>();

    //* 서버 health check를 위한 요청인 경우 로그를 남기지 않음
    if (req.url === healthCheckUrl) return next.handle();

    //* 최종적으로 핸들러에 넘기기 전 시간 저장
    const onStartHandleDate = Date.now();

    return next.handle().pipe(
      //* 요청 응답이 성공적인 경우
      tap(() => {
        this.logger.log(
          `SUCCESS: [${req.method}] ${req.url} +${
            Date.now() - onStartHandleDate
          }ms`,
        );
      }),

      /**
       * @deprecated NestJS의 request lifecycle에 의해,
       * middleware와 guard로 인해 발생하는 exception은 interceptor가 잡아낼 수 없습니다.
       * 따라서 성공한 요청에 대한 log는 interceptor에서 처리하되,
       * 실패한 요청에 대한 log는 (exception)filter에서 처리합니다.
       * all.exception.filter.ts 파일을 참고하세요.
       */
      //* 요청 처리 중 에러가 발생한 경우
      // catchError((error: HttpException) => {
      //   const customExceptionResponse =
      //     error.getResponse() as CustomExceptionResonse;
      //   console.error(
      //     `FAILED: [${req.method}] ${req.url} - ${customExceptionResponse.error}`,
      //   );
      //   return throwError(() => error);
      // }),
    );
  }
}
