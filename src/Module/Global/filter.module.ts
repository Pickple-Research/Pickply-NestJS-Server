import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import {
  AllExceptionFilter,
  HttpExceptionFilter,
  MongoExceptionFilter,
} from "../../Exception/Filter";

/**
 * 전역으로 적용되는 Filter들을 모듈화한 클래스입니다.
 * @author 현웅
 */
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: MongoExceptionFilter,
    // },
  ],
})
export class FilterModule {}
