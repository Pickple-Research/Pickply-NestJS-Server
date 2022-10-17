import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession, FilterQuery, UpdateQuery } from "mongoose";
import { ResearchNotFoundException } from "src/Exception";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchView,
  ResearchViewDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchUser,
  ResearchUserDocument,
} from "src/Schema";

/**
 * 리서치 데이터를 수정하는 서비스 집합입니다
 * @author 현웅
 */
@Injectable()
export class MongoResearchUpdateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
  ) {}

  /**
   * @Transaction
   * 리서치 정보를 업데이트합니다.
   * @return 수정된 리서치 정보
   * @author 현웅
   */
  async updateResearch(
    param: {
      researchId: string;
      updateQuery: UpdateQuery<ResearchDocument>;
      handleAsException?: boolean;
    },
    session?: ClientSession,
  ) {
    //* 리서치가 존재하지 않는 경우, 기본적으로 예외를 던집니다.
    const handleAsException = param.handleAsException
      ? param.handleAsException
      : true;

    const updatedResearch = await this.Research.findByIdAndUpdate(
      param.researchId,
      param.updateQuery,
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    if (!updatedResearch) {
      if (handleAsException) throw new ResearchNotFoundException();
      else return null;
    }

    return updatedResearch;
  }

  async updateResearchViews(
    param: {
      filterQuery?: FilterQuery<ResearchViewDocument>;
      updateQuery?: UpdateQuery<ResearchViewDocument>;
    },
    session?: ClientSession,
  ) {
    await this.ResearchView.updateMany(param.filterQuery, param.updateQuery, {
      session,
    });
  }
  async updateResearchScraps(
    param: {
      filterQuery?: FilterQuery<ResearchScrapDocument>;
      updateQuery?: UpdateQuery<ResearchScrapDocument>;
    },
    session?: ClientSession,
  ) {
    await this.ResearchScrap.updateMany(param.filterQuery, param.updateQuery, {
      session,
    });
  }
  async updateResearchParticipations(
    param: {
      filterQuery?: FilterQuery<ResearchParticipationDocument>;
      updateQuery?: UpdateQuery<ResearchParticipationDocument>;
    },
    session?: ClientSession,
  ) {
    await this.ResearchParticipation.updateMany(
      param.filterQuery,
      param.updateQuery,
      { session },
    );
  }
  async updateResearchComments(
    param: {
      filterQuery?: FilterQuery<ResearchCommentDocument>;
      updateQuery?: UpdateQuery<ResearchCommentDocument>;
    },
    session?: ClientSession,
  ) {
    await this.ResearchComment.updateMany(
      param.filterQuery,
      param.updateQuery,
      { session },
    );
  }
  async updateResearchReplies(
    param: {
      filterQuery?: FilterQuery<ResearchReplyDocument>;
      updateQuery?: UpdateQuery<ResearchReplyDocument>;
    },
    session?: ClientSession,
  ) {
    await this.ResearchReply.updateMany(param.filterQuery, param.updateQuery, {
      session,
    });
  }

  /**
   * 리서치 댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockResearchComment(commentId: string) {
    await this.ResearchComment.findByIdAndUpdate(commentId, {
      $set: { blocked: true },
    });
    return;
  }

  /**
   * 리서치 대댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockResearchReply(replyId: string) {
    await this.ResearchReply.findByIdAndUpdate(replyId, {
      $set: { blocked: true },
    });
    return;
  }
}
