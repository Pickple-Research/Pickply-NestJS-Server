import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";

/**
 * ValidationPipe를 전역적으로 적용합니다.
 * (지정한 DTO에 맞춰 요청하지 않으면 응답을 거절)
 * @author 현웅
 */
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class PipeModule {}
