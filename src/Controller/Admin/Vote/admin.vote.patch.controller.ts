import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoVoteUpdateService } from "src/Mongo";
import {
  VoteBlockBodyDto,
  CommentBlockBodyDto,
  ReplyBlockBodyDto,
} from "src/Dto";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 투표 관련 Patch 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/votes")
export class AdminVotePatchController {
  constructor() {}

  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * 투표를 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("block")
  async blockVote(@Body() body: VoteBlockBodyDto) {
    return await this.mongoVoteUpdateService.updateVote({
      voteId: body.voteId,
      updateQuery: { $set: { blocked: true } },
    });
  }

  /**
   * 투표 댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("comments/block")
  async blockVoteComment(@Body() body: CommentBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteComment(body.commentId);
  }

  /**
   * 투표 대댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("replies/block")
  async blockVoteReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteReply(body.replyId);
  }
}
