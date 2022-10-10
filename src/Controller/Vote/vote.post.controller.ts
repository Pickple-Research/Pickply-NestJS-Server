import { Controller, Inject, Request, Param, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  Notification,
  Vote,
  VoteComment,
  VoteReply,
  VoteCommentReport,
  VoteReplyReport,
} from "src/Schema";
import { UserCreateService } from "src/Service";
import { MongoVoteFindService, MongoVoteCreateService } from "src/Mongo";
import {
  VoteCreateBodyDto,
  VoteCommentCreateBodyDto,
  VoteReplyCreateBodyDto,
  VoteReportBodyDto,
  VoteCommentReportBodyDto,
  VoteReplyReportBodyDto,
  VoteMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { AlarmType } from "src/Object/Enum";
import { tryMultiTransaction, getCurrentISOTime } from "src/Util";
import {
  MONGODB_VOTE_CONNECTION,
  NEW_COMMENT_ALRAM_TITLE,
  NEW_COMMENT_ALRAM_CONTENT,
  NEW_REPLY_ALRAM_TITLE,
  NEW_REPLY_ALRAM_CONTENT,
} from "src/Constant";

@Controller("votes")
export class VotePostController {
  constructor(
    private readonly userCreateService: UserCreateService,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoVoteFindService: MongoVoteFindService;
  @Inject()
  private readonly mongoVoteCreateService: MongoVoteCreateService;

  /**
   * @Transaction
   * 새로운 투표를 업로드합니다.
   * @return 생성된 투표 정보
   * @author 현웅
   */
  @Post("")
  async uploadVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    const vote: Vote = {
      ...body,
      authorId: req.user.userId,
      result: Array(body.options.length).fill(0),
      nonMemeberResult: Array(body.options.length).fill(0),
      createdAt: getCurrentISOTime(),
    };

    return await tryMultiTransaction(async () => {
      const newVote = await this.mongoVoteCreateService.createVote(
        { vote },
        voteSession,
      );
      return newVote;
    }, [voteSession]);
  }

  /**
   * @Transaction
   * 새로운 투표 댓글을 작성합니다.
   * @return 업데이트된 투표 정보와 생성된 투표 댓글
   * @author 현웅
   */
  @Post("comments")
  async uploadVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCommentCreateBodyDto,
  ) {
    const currentISOTime = getCurrentISOTime();

    const comment: VoteComment = {
      voteId: body.voteId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: currentISOTime,
    };

    const voteSession = await this.voteConnection.startSession();

    const { updatedVote, newComment } = await tryMultiTransaction(async () => {
      return await this.mongoVoteCreateService.createVoteComment(
        { comment },
        voteSession,
      );
    }, [voteSession]);

    //* 투표 댓글 생성이 완료되면 해당 내용에 대한 알림을 생성하고 알림을 보냅니다.
    if (req.user.userId !== updatedVote.authorId) {
      const notification: Notification = {
        userId: updatedVote.authorId,
        type: AlarmType.NEW_COMMENT_TO_VOTE,
        title: NEW_COMMENT_ALRAM_TITLE,
        content: NEW_COMMENT_ALRAM_CONTENT,
        detail: updatedVote.title,
        createdAt: currentISOTime,
        voteId: body.voteId,
      };
      this.userCreateService.makeNotification({ notification });
    }

    return { updatedVote, newComment };
  }

  /**
   * @Transaction
   * 새로운 투표 대댓글을 작성합니다.
   * @return 업데이트된 투표 정보와 생성된 투표 대댓글
   * @author 현웅
   */
  @Post("replies")
  async uploadVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReplyCreateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    const reply: VoteReply = {
      voteId: body.voteId,
      commentId: body.commentId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };

    const { updatedVote, newReply } = await tryMultiTransaction(async () => {
      return await this.mongoVoteCreateService.createVoteReply(
        { reply },
        voteSession,
      );
    }, [voteSession]);

    //* 투표 대댓글 생성이 완료되면 해당 내용에 대한 알림을 생성하고 알림을 보냅니다.
    if (req.user.userId !== body.targetUserId) {
      const notification: Notification = {
        userId: body.targetUserId,
        type: AlarmType.NEW_REPLY_TO_VOTE,
        title: NEW_REPLY_ALRAM_TITLE,
        content: NEW_REPLY_ALRAM_CONTENT,
        detail: updatedVote.title,
        createdAt: getCurrentISOTime(),
        voteId: body.voteId,
      };

      this.userCreateService.makeNotification({ notification });
    }

    return { updatedVote, newReply };
  }

  /**
   * 투표를 신고합니다.
   * @return 투표 신고 정보
   * @author 현웅
   */
  @Post("report")
  async reportVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReportBodyDto,
  ) {
    return await this.mongoVoteCreateService.createVoteReport({
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      voteId: body.voteId,
      content: body.content,
    });
  }

  /**
   * 투표 댓글을 신고합니다.
   * @return 투표 댓글 신고 정보
   * @author 현웅
   */
  @Post("report/comments")
  async reportVoteComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteCommentReportBodyDto,
  ) {
    const voteCommentReport: VoteCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      comment: body.comment,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoVoteCreateService.createVoteCommentReport({
      voteCommentReport,
    });
  }

  /**
   * 투표 대댓글을 신고합니다.
   * @return 투표 대댓글 신고 정보
   * @author 현웅
   */
  @Post("report/replies")
  async reportVoteReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteReplyReportBodyDto,
  ) {
    const voteReplyReport: VoteReplyReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      reply: body.reply,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoVoteCreateService.createVoteReplyReport({
      voteReplyReport,
    });
  }

  /**
   * 마이페이지 - 스크랩/참여한 투표 목록을 더 가져옵니다.
   * @author 현웅
   */
  @Post("mypage")
  async getMypageVotes(@Body() body: VoteMypageBodyDto) {
    return await this.mongoVoteFindService.getVotesByIds(body.voteIds);
  }
}
