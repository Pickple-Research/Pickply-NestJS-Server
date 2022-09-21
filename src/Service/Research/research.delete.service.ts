import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoResearchFindService,
  MongoResearchDeleteService,
} from "src/Mongo";

@Injectable()
export class ResearchDeleteService {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

  /**
   * 리서치를 삭제합니다.
   * 이 때, 삭제를 요청한 유저가 작성자가 아닐 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteResearch(
    param: { userId: string; researchId: string },
    session: ClientSession,
  ) {
    //* 리서치 삭제를 요청한 유저가 리서치 작성자인지 여부를 확인합니다.
    const checkIsAuthor = this.mongoResearchFindService.isResearchAuthor({
      userId: param.userId,
      researchId: param.researchId,
    });

    //* 리서치 삭제 요청 전에 리서치에 참여한 사람이 있는지 확인합니다.
    const checkAbleToDelete =
      this.mongoResearchFindService.isAbleToDeleteResearch(param.researchId);

    //* 리서치와 관련된 모든 정보를 삭제합니다.
    const deleteResearch = this.mongoResearchDeleteService.deleteResearchById(
      { researchId: param.researchId },
      session,
    );

    await Promise.all([checkIsAuthor, checkAbleToDelete, deleteResearch]);
    return;
  }

  /**
   * @Transaction
   * 투표 댓글을 삭제합니다.
   * 삭제를 요청한 유저가 투표 댓글을 작성한 유저가 아니라면 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteResearchComment(
    param: { userId: string; researchId: string; commentId: string },
    session: ClientSession,
  ) {
    //* 댓글 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchCommentAuthor(
      {
        userId: param.userId,
        commentId: param.commentId,
      },
    );
    //* 댓글 삭제 (이 때, 대댓글이 추가로 달린 경우엔 deleted 플래그만 true 로 설정)
    const deleteResearchComment =
      this.mongoResearchDeleteService.deleteResearchComment(
        { researchId: param.researchId, commentId: param.commentId },
        session,
      );
    return await Promise.all([checkIsAuthor, deleteResearchComment]);
  }

  /**
   * @Transaction
   * 투표 대댓글을 삭제합니다.
   * 삭제를 요청한 유저가 투표 대댓글을 작성한 유저가 아니라면 에러를 일으킵니다.
   * @author 현웅
   */
  async deleteResearchReply(
    param: {
      userId: string;
      researchId: string;
      commentId: string;
      replyId: string;
    },
    session: ClientSession,
  ) {
    //* 대댓글 작성자인지 확인
    const checkIsAuthor = this.mongoResearchFindService.isResearchReplyAuthor({
      userId: param.userId,
      replyId: param.replyId,
    });
    //* 대댓글 삭제 (이 때, 대댓글이 추가로 달린 경우엔 deleted 플래그만 true 로 설정)
    const deleteResearchReply =
      this.mongoResearchDeleteService.deleteResearchReply(
        {
          researchId: param.researchId,
          commentId: param.commentId,
          replyId: param.replyId,
        },
        session,
      );
    return await Promise.all([checkIsAuthor, deleteResearchReply]);
  }
}
