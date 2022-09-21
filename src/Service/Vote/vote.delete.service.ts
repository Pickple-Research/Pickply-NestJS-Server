import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { MongoVoteFindService, MongoVoteDeleteService } from "src/Mongo";

@Injectable()
export class VoteDeleteService {
  constructor() {}

  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  /**
   * 리서치를 삭제합니다.
   * 이 때, 삭제를 요청한 유저가 작성자가 아닐 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    //* 투표 삭제를 요청한 유저가 투표 작성자인지 여부를 확인합니다.
    const checkIsAuthor = this.mongoVoteFindService.isVoteAuthor({
      userId: param.userId,
      voteId: param.voteId,
    });
    //* 투표 삭제 요청 시기를 기준으로 참여자 수가 10명 보다 적은지 확인합니다.
    const checkAbleToDelete = this.mongoVoteFindService.isAbleToDeleteVote(
      param.voteId,
    );
    //* 투표와 관련된 모든 정보를 삭제합니다.
    const deleteVote = this.mongoVoteDeleteService.deleteVoteById(
      { voteId: param.voteId },
      session,
    );

    await Promise.all([checkIsAuthor, checkAbleToDelete, deleteVote]);
    return;
  }

  /**
   * @Transaction
   * 투표 댓글을 삭제합니다.
   * 삭제를 요청한 유저가 투표 댓글을 작성한 유저가 아니라면 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteVoteComment(
    param: { userId: string; voteId: string; commentId: string },
    session: ClientSession,
  ) {
    //* 댓글 작성자인지 확인
    const checkIsAuthor = this.mongoVoteFindService.isVoteCommentAuthor({
      userId: param.userId,
      commentId: param.commentId,
    });
    //* 댓글 삭제 (이 때, 대댓글이 추가로 달린 경우엔 deleted 플래그만 true 로 설정)
    const deleteVoteComment = this.mongoVoteDeleteService.deleteVoteComment(
      {
        voteId: param.voteId,
        commentId: param.commentId,
      },
      session,
    );
    return await Promise.all([checkIsAuthor, deleteVoteComment]);
  }

  /**
   * @Transaction
   * 투표 대댓글을 삭제합니다.
   * 삭제를 요청한 유저가 투표 대댓글을 작성한 유저가 아니라면 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteVoteReply(
    param: {
      userId: string;
      voteId: string;
      commentId: string;
      replyId: string;
    },
    session: ClientSession,
  ) {
    //* 대댓글 작성자인지 확인
    const checkIsAuthor = this.mongoVoteFindService.isVoteReplyAuthor({
      userId: param.userId,
      replyId: param.replyId,
    });
    //* 대댓글 삭제 (이 때, 대댓글이 추가로 달린 경우엔 deleted 플래그만 true 로 설정)
    const deleteVoteReply = this.mongoVoteDeleteService.deleteVoteReply(
      {
        voteId: param.voteId,
        commentId: param.commentId,
        replyId: param.replyId,
      },
      session,
    );
    return await Promise.all([checkIsAuthor, deleteVoteReply]);
  }
}
