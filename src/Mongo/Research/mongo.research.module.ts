import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AwsS3Service } from "src/AWS";
import {
  MongoResearchCreateService,
  MongoResearchDeleteService,
  MongoResearchFindService,
  MongoResearchUpdateService,
} from "src/Mongo";
import {
  Research,
  ResearchSchema,
  ResearchComment,
  ResearchCommentSchema,
  ResearchCommentReport,
  ResearchCommentReportSchema,
  ResearchParticipation,
  ResearchParticipationSchema,
  ResearchReply,
  ResearchReplySchema,
  ResearchReplyReport,
  ResearchReplyReportSchema,
  ResearchReport,
  ResearchReportSchema,
  ResearchScrap,
  ResearchScrapSchema,
  ResearchUser,
  ResearchUserSchema,
  ResearchView,
  ResearchViewSchema,
} from "src/Schema";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

@Module({
  providers: [
    AwsS3Service,
    MongoResearchCreateService,
    MongoResearchDeleteService,
    MongoResearchFindService,
    MongoResearchUpdateService,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Research.name, schema: ResearchSchema },
        {
          name: ResearchComment.name,
          schema: ResearchCommentSchema,
        },
        {
          name: ResearchCommentReport.name,
          schema: ResearchCommentReportSchema,
        },
        {
          name: ResearchParticipation.name,
          schema: ResearchParticipationSchema,
        },
        {
          name: ResearchReply.name,
          schema: ResearchReplySchema,
        },
        {
          name: ResearchReplyReport.name,
          schema: ResearchReplyReportSchema,
        },
        {
          name: ResearchReport.name,
          schema: ResearchReportSchema,
        },
        {
          name: ResearchScrap.name,
          schema: ResearchScrapSchema,
        },
        {
          name: ResearchUser.name,
          schema: ResearchUserSchema,
        },
        {
          name: ResearchView.name,
          schema: ResearchViewSchema,
        },
      ],
      MONGODB_RESEARCH_CONNECTION,
    ),
  ],
  exports: [
    MongoResearchCreateService,
    MongoResearchDeleteService,
    MongoResearchFindService,
    MongoResearchUpdateService,
  ],
})
export class MongoResearchModule {}
