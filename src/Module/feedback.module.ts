import { Module } from "@nestjs/common";
import { FeedbackGetController } from "../Controller";
import { FeedbackFindService } from "../Service";
import { MongoFeedbackModule } from "../Mongo";

@Module({
  controllers: [FeedbackGetController],
  providers: [FeedbackFindService],
  imports: [MongoFeedbackModule],
})
export class FeedbackModule {}
