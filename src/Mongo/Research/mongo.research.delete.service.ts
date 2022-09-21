import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { AwsS3Service } from "src/AWS";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchUser,
  ResearchUserDocument,
  ResearchView,
  ResearchViewDocument,
} from "src/Schema";
import { BUCKET_NAME } from "src/Constant";

@Injectable()
export class MongoResearchDeleteService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * @Transaction
   * 유저 탈퇴시, ResearchUser 정보를 함께 삭제합니다.
   * @author 현웅
   */
  async deleteResearchUser(param: { userId: string }, session: ClientSession) {
    await this.ResearchUser.findByIdAndUpdate(
      param.userId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 리서치를 삭제합니다.
   * @author 현웅
   */
  //TODO: AWS S3 오브젝트도 함께 지워야 합니다.
  async deleteResearchById(
    param: { researchId: string },
    session: ClientSession,
  ) {
    //* 리서치 삭제
    await this.Research.findByIdAndDelete(param.researchId, { session });
    //* 리서치 참여 정보 삭제
    await this.ResearchParticipation.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    //* 리서치 조회 정보 삭제
    await this.ResearchView.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    //* 리서치 스크랩 정보 삭제
    await this.ResearchScrap.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    //* 댓글과 대댓글 모두 삭제
    await this.ResearchComment.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    await this.ResearchReply.deleteMany(
      { researchId: param.researchId },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 리서치 댓글을 삭제합니다.
   * 이 때, 해당 댓글에 대댓글이 달려있는 경우엔 deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  async deleteResearchComment(
    param: { researchId: string; commentId: string },
    session: ClientSession,
  ) {
    //* 대상 댓글 조회
    const comment = await this.ResearchComment.findById(param.commentId)
      .select({ replies: 1 })
      .lean();
    //* 대댓글이 달려있지 않은 경우, 댓글 삭제 후 리서치 댓글 수 1 감소
    if (comment.replies.length === 0) {
      await this.ResearchComment.findByIdAndDelete(param.commentId, {
        session,
      });
      await this.Research.findByIdAndUpdate(
        param.researchId,
        {
          $inc: { commentsNum: -1 },
        },
        { session },
      );
      return;
    }
    //* 그렇지 않은 경우, deleted 플래그만 true 로 설정
    return await this.ResearchComment.findByIdAndUpdate(
      param.commentId,
      { $set: { deleted: true } },
      { session },
    );
  }

  /**
   * @Transaction
   * 리서치 대댓글을 삭제합니다.
   * 이 때, 추가 대댓글이 달려있는 경우엔 deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  async deleteResearchReply(
    param: { researchId: string; commentId: string; replyId: string },
    session: ClientSession,
  ) {
    //* 해당 대댓글의 부모 댓글 조회
    const comment = await this.ResearchComment.findById(param.commentId)
      .select({ replies: 1 })
      .lean();
    //* 대상 대댓글의 인덱스 조회
    const replyIndex = comment.replies.findIndex(
      (replyId) => replyId.toString() === param.replyId,
    );

    //* 대상 대댓글이 부모 댓글의 마지막 대댓글인 경우
    //* 대댓글 삭제, 댓글에서 대댓글 id 삭제 후 리서치 댓글 수 1 감소
    if (replyIndex === comment.replies.length - 1) {
      await this.ResearchReply.findByIdAndDelete(param.replyId, {
        session,
      });
      await this.ResearchComment.findByIdAndUpdate(
        param.commentId,
        { $pull: { replies: param.replyId } },
        { session },
      );
      await this.Research.findByIdAndUpdate(
        param.researchId,
        {
          $inc: { commentsNum: -1 },
        },
        { session },
      );
      return;
    }
    //* 그렇지 않은 경우, deleted 플래그만 true 로 설정
    await this.ResearchReply.findByIdAndUpdate(
      param.replyId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * 리서치 스크랩 취소시: 리서치 스크랩 정보를 삭제합니다.
   * @author 현웅
   */
  async deleteResearchScrap(param: { userId: string; researchId: string }) {
    return await this.ResearchScrap.findOneAndDelete({
      userId: param.userId,
      researchId: param.researchId,
    });
  }
}
