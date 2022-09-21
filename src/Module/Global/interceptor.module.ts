import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "../../Interceptor";

/**
 * 전역으로 적용되는 Interceptor들을 모듈화한 클래스입니다.
 * @author 현웅
 */
@Module({
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class InterceptorModule {}
