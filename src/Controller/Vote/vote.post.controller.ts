import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  Notification,
  Vote,
  VoteNonMemberParticipation,
  VoteParticipation,
  VoteComment,
  VoteReply,
  VoteCommentReport,
  VoteReplyReport,
  CreditHistory,
} from "src/Schema";
import { UserCreateService, VoteUpdateService } from "src/Service";
import { MongoVoteFindService, MongoVoteCreateService } from "src/Mongo";
import {
  VoteCreateBodyDto,
  VoteParticipateBodyDto,
  VoteNonMemberParticipateBodyDto,
  InquireVoteStatisticsBodyDto,
  VoteCommentCreateBodyDto,
  VoteReplyCreateBodyDto,
  VoteReportBodyDto,
  VoteCommentReportBodyDto,
  VoteReplyReportBodyDto,
  VoteMypageBodyDto,
} from "src/Dto";
import { Public } from "src/Security/Metadata";
import { JwtUserInfo } from "src/Object/Type";
import { AlarmType, CreditHistoryType } from "src/Object/Enum";
import { tryMultiTransaction, getCurrentISOTime } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
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
    private readonly voteUpdateService: VoteUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
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
      //* 투표 결과 통계 분석을 위한 property 추가
      analytics: Array(body.options.length).fill({
        MALE: {},
        FEMALE: {},
      }),
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
   * 투표에 참여합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 참여 정보
   * @author 현웅
   */
  @Post("participate")
  async participateVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteParticipateBodyDto,
  ) {
    //* 투표 참여 정보
    const voteParticipation: VoteParticipation = {
      userId: req.user.userId,
      voteId: body.voteId,
      selectedOptionIndexes: body.selectedOptionIndexes,
      gender: body.gender,
      ageGroup: body.ageGroup,
      createdAt: getCurrentISOTime(),
    };

    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      const { updatedVote, newVoteParticipation } =
        await this.voteUpdateService.participateVote(
          { voteId: body.voteId, voteParticipation },
          voteSession,
        );
      return { updatedVote, newVoteParticipation };
    }, [voteSession]);
  }

  /**
   * (비회원) 투표에 참여합니다.
   * @return 업데이트된 투표 정보, 생성된 비회원 투표 참여 정보
   * @author 현웅
   */
  @Public()
  @Post("participate/public")
  async nonMemberParticipateVote(
    @Body() body: VoteNonMemberParticipateBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    const voteNonMemberParticipation: VoteNonMemberParticipation = {
      voteId: body.voteId,
      selectedOptionIndexes: body.selectedOptionIndexes,
      fcmToken: body.fcmToken,
      createdAt: getCurrentISOTime(),
    };

    return await tryMultiTransaction(async () => {
      const { updatedVote, newVoteNonMemberParticipation } =
        await this.voteUpdateService.nonMemberParticipateVote(
          {
            voteId: body.voteId,
            voteNonMemberParticipation,
          },
          voteSession,
        );
      return { updatedVote, newVoteNonMemberParticipation };
    }, [voteSession]);
  }

  /**
   * 투표에 참여하지 않은 상태에서 투표 결과 통계 분석을 확인합니다.
   * 선택지 index 배열이 빈 리스트인 투표 참여 데이터와
   * 크레딧 사용 내역을 생성합니다.
   * @return 생성된 투표 참여 정보, 생성된 크레딧 사용내역 정보
   * @author 현웅
   */
  @Post("stat") // abbr. statistics
  async getVoteStatistics(
    @Request() req: { user: JwtUserInfo },
    @Body() body: InquireVoteStatisticsBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    const currentISOTime = getCurrentISOTime();

    const voteParticipation: VoteParticipation = {
      userId: req.user.userId,
      voteId: body.voteId,
      selectedOptionIndexes: [],
      gender: body.gender,
      ageGroup: body.ageGroup,
      createdAt: currentISOTime,
    };

    const creditHistory: Omit<CreditHistory, "balance"> = {
      userId: req.user.userId,
      reason: body.voteTitle,
      type: CreditHistoryType.INQUIRE_VOTE_STAT,
      scale: -1,
      isIncome: false,
      createdAt: currentISOTime,
    };

    return await tryMultiTransaction(async () => {
      const createVoteParticipation =
        this.mongoVoteCreateService.createVoteParticipation(
          { voteParticipation },
          voteSession,
        );
      const createCreditHistory = this.userCreateService.createCreditHistory(
        { userId: req.user.userId, creditHistory },
        userSession,
      );

      return await Promise.all([
        createVoteParticipation,
        createCreditHistory,
      ]).then(([newVoteParticipation, newCreditHistory]) => {
        return { newVoteParticipation, newCreditHistory };
      });
    }, [userSession, voteSession]);
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
