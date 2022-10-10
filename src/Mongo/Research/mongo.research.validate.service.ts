import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchView,
  ResearchViewDocument,
} from "src/Schema";
import {
  AlreadyParticipatedResearchException,
  NotResearchAuthorException,
  ResearchNotFoundException,
  UnableToDeleteResearchException,
} from "src/Exception";

/**
 * Research 와 관련된 작업을 수행할 때,
 * 해당 작업을 진행해도 되는지에 대한 유효성 검사를 수행합니다.
 * @author 현웅
 */
@Injectable()
export class MongoResearchValidateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,
  ) {}

  /**
   * 유저가 이미 리서치를 조회한 적이 있는지 확인합니다.
   * 혹시 조회한 적이 있더라도 에러를 발생시키진 않습니다.
   * @author 현웅
   */
  async isUserAlreadyViewedResearch(param: {
    userId: string;
    researchId: string;
  }) {
    const researchView = await this.ResearchView.findOne({
      userId: param.userId,
      researchId: param.researchId,
    })
      .select({ _id: 1 })
      .lean();
    if (researchView) return true;

    return false;
  }

  /**
   * 유저가 이미 리서치에 참여한 적이 있는지 확인합니다.
   * 참여한 적이 있는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isUserAlreadyParticipatedResearch(param: {
    userId: string;
    researchId: string;
  }) {
    const researchParticipation = await this.ResearchParticipation.findOne({
      userId: param.userId,
      researchId: param.researchId,
    })
      .select({ _id: 1 })
      .lean();
    if (researchParticipation) throw new AlreadyParticipatedResearchException();
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * 단, skipValidation 이 true 인 경우 반드시 검증을 통과합니다.
   * @author 현웅
   */
  async isResearchAuthor(param: {
    userId: string;
    researchId: string;
    skipValidation?: boolean;
  }) {
    if (param.skipValidation === true) return;

    const research = await this.Research.findById(param.researchId)
      .select({ authorId: 1 })
      .sort({ _id: -1 })
      .lean();

    if (!research) throw new ResearchNotFoundException();
    if (research.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isResearchCommentAuthor(param: { userId: string; commentId: string }) {
    const researchComment = await this.ResearchComment.findById(param.commentId)
      .select({ authorId: 1 })
      .lean();
    if (researchComment.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 대댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isResearchReplyAuthor(param: { userId: string; replyId: string }) {
    const researchReply = await this.ResearchReply.findById(param.replyId)
      .select({ authorId: 1 })
      .lean();
    if (researchReply.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 리서치 참여자 수가 0명으로, 삭제 가능한지 확인합니다.
   * 0명이 아닌 경우 에러를 발생시킵니다.
   * @author 현웅
   */
  async isAbleToDeleteResearch(researchId: string) {
    const research = await this.Research.findById(researchId)
      .select({ participantsNum: 1 })
      .lean();

    if (!research) throw new ResearchNotFoundException();
    if (research.participantsNum !== 0) {
      throw new UnableToDeleteResearchException();
    }
    return;
  }
}
