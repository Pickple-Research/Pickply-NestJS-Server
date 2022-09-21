import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { EmailAuthStrategy, JwtAuthStrategy } from "src/Security/Strategy";
import { EmailAuthGuard, JwtAuthGuard, RolesGuard } from "src/Security/Guard";

/**
 * 전역으로 적용되는 Guard들을 모듈화한 클래스입니다.
 * @author 현웅
 */
@Module({
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: EmailAuthGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    //* 각 Guard에서 사용하는 Strategy 들도 provider로 명시하여야 합니다
    // EmailAuthStrategy,
    JwtAuthStrategy,
  ],
})
export class GuardModule {}
