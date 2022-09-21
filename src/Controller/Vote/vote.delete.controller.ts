import {
  Controller,
  Request,
  Param,
  Headers,
  Delete,
  Inject,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoVoteDeleteService } from "src/Mongo";
import { VoteDeleteService } from "src/Service";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";
import { Public } from "src/Security/Metadata";

@Controller("votes")
export class VoteDeleteController {
  constructor(
    private readonly voteDeleteService: VoteDeleteService,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  /**
   * @deprecated
   * !caution: 서버에서 header 데이터를 못 받습니다
   * 투표를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteVote(
    @Request() req: { user: JwtUserInfo },
    @Headers("vote_id") voteId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVote(
        { userId: req.user.userId, voteId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }

  /**
   * 투표를 삭제합니다.
   * @author 현웅
   */
  @Delete(":voteId")
  async deleteVoteWithParam(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { voteId: string },
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVote(
        { userId: req.user.userId, voteId: param.voteId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }

  /**
   * 투표 댓글을 삭제합니다.
   * 해당 댓글에 대댓글이 달려있는 경우, deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  @Delete(":voteId/comments/:commentId")
  async deleteVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Param("commentId") commentId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVoteComment(
        { userId: req.user.userId, voteId, commentId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }

  /**
   * 투표 대댓글을 삭제합니다.
   * 해당 대댓글 이후 또 다른 대댓글이 달려있는 경우, deleted 플래그만 true 로 설정합니다.
   * @author 현웅
   */
  @Delete(":voteId/comments/:commentId/replies/:replyId")
  async deleteVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Param("voteId") voteId: string,
    @Param("commentId") commentId: string,
    @Param("replyId") replyId: string,
  ) {
    const voteSession = await this.voteConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.voteDeleteService.deleteVoteReply(
        { userId: req.user.userId, voteId, commentId, replyId },
        voteSession,
      );
    }, [voteSession]);
    return;
  }
}
