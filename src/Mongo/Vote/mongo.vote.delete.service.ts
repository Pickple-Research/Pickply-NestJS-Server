import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteComment,
  VoteCommentDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteReply,
  VoteReplyDocument,
  VoteScrap,
  VoteScrapDocument,
  VoteUser,
  VoteUserDocument,
  VoteView,
  VoteViewDocument,
} from "src/Schema";

@Injectable()
export class MongoVoteDeleteService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteScrap.name)
    private readonly VoteScrap: Model<VoteScrapDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
    @InjectModel(VoteView.name)
    private readonly VoteView: Model<VoteViewDocument>,
  ) {}

  /**
   * @Transaction
   * 유저 탈퇴시, VoteUser 정보를 함께 삭제합니다.
   * @author 현웅
   */
  async deleteVoteUser(param: { userId: string }, session: ClientSession) {
    await this.VoteUser.findByIdAndUpdate(
      param.userId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 투표를 삭제합니다.
   * @author 현웅
   */
  async deleteVoteById(param: { voteId: string }, session: ClientSession) {
    //* 투표 삭제
    await this.Vote.findByIdAndDelete(param.voteId, { session });
    //* 투표 참여 정보 삭제
    await this.VoteParticipation.deleteMany(
      { voteId: param.voteId },
      { session },
    );
    //* 투표 조회 정보 삭제
    await this.VoteView.deleteMany({ voteId: param.voteId }, { session });
    //* 투표 스크랩 정보 삭제
    await this.VoteScrap.deleteMany({ voteId: param.voteId }, { session });
    //* 댓글과 대댓글 모두 삭제
    await this.VoteComment.deleteMany({ voteId: param.voteId }, { session });
    await this.VoteReply.deleteMany({ voteId: param.voteId }, { session });
    return;
  }

  /**
   * @Transaction
   * 투표 댓글을 삭제합니다.
   * 이 때, 해당 댓글에 대댓글이 달려있는 경우엔 deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  async deleteVoteComment(
    param: { voteId: string; commentId: string },
    session: ClientSession,
  ) {
    //* 대상 댓글 조회
    const comment = await this.VoteComment.findById(param.commentId)
      .select({ replies: 1 })
      .lean();
    //* 대댓글이 달려있지 않은 경우, 댓글 삭제 후 댓글 수 1 감소
    if (comment.replies.length === 0) {
      await this.VoteComment.findByIdAndDelete(param.commentId, {
        session,
      });
      await this.Vote.findByIdAndUpdate(
        param.voteId,
        { $inc: { commentsNum: -1 } },
        { session },
      );
      return;
    }
    //* 그렇지 않은 경우, deleted 플래그만 true 로 설정
    return await this.VoteComment.findByIdAndUpdate(
      param.commentId,
      { $set: { deleted: true } },
      { session },
    );
  }

  /**
   * @Transaction
   * 투표 대댓글을 삭제합니다.
   * 이 때, 추가 대댓글이 달려있는 경우엔 deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  async deleteVoteReply(
    param: { voteId: string; commentId: string; replyId: string },
    session: ClientSession,
  ) {
    //* 해당 대댓글의 부모 댓글 조회
    const comment = await this.VoteComment.findById(param.commentId)
      .select({ replies: 1 })
      .lean();
    //* 대상 대댓글의 인덱스 조회
    const replyIndex = comment.replies.findIndex(
      (replyId) => replyId.toString() === param.replyId,
    );

    //* 대상 대댓글이 부모 댓글의 마지막 대댓글인 경우
    //* 대댓글 삭제, 댓글에서 대댓글 id 삭제 후 리서치 댓글 수 1 감소
    if (replyIndex === comment.replies.length - 1) {
      await this.VoteReply.findByIdAndDelete(param.replyId, { session });
      await this.VoteComment.findByIdAndUpdate(
        param.commentId,
        { $pull: { replies: param.replyId } },
        { session },
      );
      await this.Vote.findByIdAndUpdate(
        param.voteId,
        { $inc: { commentsNum: -1 } },
        { session },
      );
      return;
    }
    //* 그렇지 않은 경우, deleted 플래그만 true 로 설정
    await this.VoteReply.findByIdAndUpdate(
      param.replyId,
      { $set: { deleted: true } },
      { session },
    );
    return;
  }

  /**
   * 투표 스크랩 취소시: 투표 스크랩 정보를 삭제합니다.
   * @author 현웅
   */
  async deleteVoteScrap(param: { userId: string; voteId: string }) {
    return await this.VoteScrap.findOneAndDelete({
      userId: param.userId,
      voteId: param.voteId,
    });
  }
}
