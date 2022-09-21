import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoFeedbackFindService } from "./mongo.feedback.find.service";
import { Feedback, FeedbackSchema } from "../../Schema";
import { MONGODB_FEEDBACK_CONNECTION } from "../../Constant";

@Module({
  providers: [MongoFeedbackFindService],
  imports: [
    MongooseModule.forFeature(
      [{ name: Feedback.name, schema: FeedbackSchema }],
      MONGODB_FEEDBACK_CONNECTION,
    ),
  ],
  exports: [MongoFeedbackFindService],
})
export class MongoFeedbackModule {}
