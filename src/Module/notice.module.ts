import { Module } from "@nestjs/common";
import { NoticeGetController, NoticePostController } from "src/Controller";
import { NoticeFindService } from "src/Service";
import { MongoNoticeModule } from "src/Mongo";

@Module({
  controllers: [NoticeGetController, NoticePostController],
  providers: [NoticeFindService],
  imports: [MongoNoticeModule],
})
export class NoticeModule {}
