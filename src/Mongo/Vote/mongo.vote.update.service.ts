import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession, FilterQuery, UpdateQuery } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteComment,
  VoteCommentDocument,
  VoteReply,
  VoteReplyDocument,
  VoteUser,
  VoteUserDocument,
} from "src/Schema";
import { VoteNotFoundException } from "src/Exception";

@Injectable()
export class MongoVoteUpdateService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
  ) {}

  // ********************************** //
  /** 기본형 **/
  // ********************************** //

  /**
   * TODO: 활용형으로 분산시킵니다
   * @Transaction
   * 투표 정보를 업데이트합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  async updateVote(
    param: {
      voteId: string;
      updateQuery: UpdateQuery<VoteDocument>;
      handleAsException?: boolean;
    },
    session?: ClientSession,
  ) {
    const handleAsException = param.handleAsException
      ? param.handleAsException
      : true;

    const updatedVote = await this.Vote.findByIdAndUpdate(
      param.voteId,
      param.updateQuery,
      { session, returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();

    if (!updatedVote) {
      if (handleAsException) throw new VoteNotFoundException();
      else return null;
    }

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    if (updatedVote.category !== "GREEN_LIGHT") return updatedVote;
    return {
      ...updatedVote,
      author: { ...updatedVote.author, nickname: "익명" },
    };
  }

  /**
   * 특정 투표 참여 정보를 업데이트합니다.
   * @author 현웅
   */
  async updateVoteParticipationById(
    param: {
      voteParticipationId: string;
      updateQuery?: UpdateQuery<VoteParticipationDocument>;
    },
    session?: ClientSession,
  ) {
    await this.VoteParticipation.findByIdAndUpdate(
      param.voteParticipationId,
      param.updateQuery,
      { session, returnOriginal: false },
    ).lean();
    return;
  }

  // ********************************** //
  /** 활용형 **/
  // ********************************** //

  /**
   * 투표 댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockVoteComment(commentId: string) {
    await this.VoteComment.findByIdAndUpdate(commentId, {
      $set: { blocked: true },
    });
    return;
  }

  /**
   * 투표 대댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockVoteReply(replyId: string) {
    await this.VoteReply.findByIdAndUpdate(replyId, {
      $set: { blocked: true },
    });
    return;
  }
}
