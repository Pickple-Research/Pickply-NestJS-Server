import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoNoticeFindService } from "./mongo.notice.find.service";
import { MongoNoticeCreateService } from "./mongo.notice.create.service";
import { Notice, NoticeSchema } from "src/Schema";
import { MONGODB_NOTICE_CONNECTION } from "src/Constant";

@Module({
  providers: [MongoNoticeFindService, MongoNoticeCreateService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Notice.name, schema: NoticeSchema }],
      MONGODB_NOTICE_CONNECTION,
    ),
  ],
  exports: [MongoNoticeFindService, MongoNoticeCreateService],
})
export class MongoNoticeModule {}
