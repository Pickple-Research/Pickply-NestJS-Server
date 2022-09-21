import { Module } from "@nestjs/common";
import { MongoUserModule } from "src/Mongo";
import { CronService } from "./cron.service";

/**
 * 주기적으로 실행되는 CronJob Service를 모은 Module입니다.
 * app.module에서 import되어 주기적으로 실행됩니다.
 * @author 현웅
 */
@Module({
  providers: [CronService],
  imports: [MongoUserModule],
})
export class CronModule {}
