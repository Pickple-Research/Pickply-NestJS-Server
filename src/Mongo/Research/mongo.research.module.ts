import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AWSModule } from "src/AWS";
import {
  MongoResearchCreateService,
  MongoResearchDeleteService,
  MongoResearchFindService,
  MongoResearchStandardizeService,
  MongoResearchUpdateService,
  MongoResearchValidateService,
} from "src/Mongo";
import {
  Research,
  ResearchSchema,
  ResearchComment,
  ResearchCommentSchema,
  ResearchCommentReport,
  ResearchCommentReportSchema,
  ResearchNonMemberParticipation,
  ResearchNonMemberParticipationSchema,
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
    MongoResearchCreateService,
    MongoResearchDeleteService,
    MongoResearchFindService,
    MongoResearchStandardizeService,
    MongoResearchUpdateService,
    MongoResearchValidateService,
  ],
  imports: [
    AWSModule,
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
          name: ResearchNonMemberParticipation.name,
          schema: ResearchNonMemberParticipationSchema,
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
    MongoResearchStandardizeService,
    MongoResearchUpdateService,
    MongoResearchValidateService,
  ],
})
export class MongoResearchModule {}
