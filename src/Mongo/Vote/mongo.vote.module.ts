import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoVoteFindService } from "./mongo.vote.find.service";
import { MongoVoteCreateService } from "./mongo.vote.create.service";
import { MongoVoteUpdateService } from "./mongo.vote.update.service";
import { MongoVoteDeleteService } from "./mongo.vote.delete.service";
import { MongoVoteValidateService } from "./mongo.vote.validate.service";
import {
  Vote,
  VoteSchema,
  VoteComment,
  VoteCommentSchema,
  VoteCommentReport,
  VoteCommentReportSchema,
  VoteParticipation,
  VoteParticipationSchema,
  VoteReply,
  VoteReplySchema,
  VoteReplyReport,
  VoteReplyReportSchema,
  VoteReport,
  VoteReportSchema,
  VoteScrap,
  VoteScrapSchema,
  VoteUser,
  VoteUserSchema,
  VoteView,
  VoteViewSchema,
} from "src/Schema";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";

@Module({
  providers: [
    MongoVoteFindService,
    MongoVoteCreateService,
    MongoVoteUpdateService,
    MongoVoteDeleteService,
    MongoVoteValidateService,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Vote.name, schema: VoteSchema },
        { name: VoteComment.name, schema: VoteCommentSchema },
        { name: VoteCommentReport.name, schema: VoteCommentReportSchema },
        { name: VoteParticipation.name, schema: VoteParticipationSchema },
        { name: VoteReply.name, schema: VoteReplySchema },
        { name: VoteReplyReport.name, schema: VoteReplyReportSchema },
        { name: VoteReport.name, schema: VoteReportSchema },
        { name: VoteScrap.name, schema: VoteScrapSchema },
        { name: VoteUser.name, schema: VoteUserSchema },
        { name: VoteView.name, schema: VoteViewSchema },
      ],
      MONGODB_VOTE_CONNECTION,
    ),
  ],
  exports: [
    MongoVoteFindService,
    MongoVoteCreateService,
    MongoVoteUpdateService,
    MongoVoteDeleteService,
    MongoVoteValidateService,
  ],
})
export class MongoVoteModule {}
