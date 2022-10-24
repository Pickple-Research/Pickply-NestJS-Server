import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Roles } from "src/Security/Metadata";
import {
  AdminUpdateService,
  AuthService,
  ResearchUpdateService,
} from "src/Service";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
  MongoResearchUpdateService,
  MongoResearchDeleteService,
  MongoVoteUpdateService,
} from "src/Mongo";
import {
  ResearchBlockBodyDto,
  VoteBlockBodyDto,
  CommentBlockBodyDto,
  ReplyBlockBodyDto,
} from "src/Dto";
import { UserType } from "src/Object/Enum";
import { CreditHistory } from "src/Schema";
import { tryMultiTransaction, getCurrentISOTime } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";

/**
 * 관리자만 사용하는 Patch 컨트롤러입니다.
 * 리서치 일괄마감, 리서치 및 투표 (대)댓글 블락 처리 등을 처리할 수 있습니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminPatchController {
  constructor(
    private readonly adminUpdateService: AdminUpdateService,
    private readonly researchUpdateService: ResearchUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly authService: AuthService;
  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * 특정 유저의 비밀번호를 초기화합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("users/password/initialize")
  async initializeUserPassword(@Body() body: { userId: string }) {
    await this.authService.initializePassword(body.userId);
  }

  /**
   * 특정 유저에게 크레딧을 증정하거나 차감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("users/credit")
  async giveCredit(
    @Body()
    body: {
      userId: string;
      scale: number;
      reason: string;
      type: string;
    },
  ) {
    const creditBalance = await this.mongoUserFindService.getUserCreditBalance(
      body.userId,
    );
    const creditHistory: CreditHistory = {
      userId: body.userId,
      scale: body.scale,
      balance: creditBalance + body.scale,
      isIncome: body.scale >= 0 ? true : false,
      reason: body.reason,
      type: body.type, // "PRODUCT_EXCHANGE"
      createdAt: getCurrentISOTime(),
    };

    const userSession = await this.userConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.mongoUserCreateService.createCreditHistory(
        { userId: body.userId, creditHistory },
        userSession,
      );
    }, [userSession]);
  }

  /**
   * 두 명 이상의 유저들에게 크레딧을 증정하거나 차감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("users/multiple/credit")
  async giveMultipleUserCredit(
    @Body()
    body: {
      userIds: string[];
      scale: number;
      reason: string;
      type: string;
    },
  ) {
    // const participations =
    //   await this.mongoResearchFindService.getResearchParticipations({
    //     filterQuery: { researchId: "" },
    //     selectQuery: { userId: true },
    //   });
    // const userIds = participations.map((participation) => participation.userId);

    const userSession = await this.userConnection.startSession();
    await tryMultiTransaction(async () => {
      for (const userId of body.userIds) {
        const creditBalance =
          await this.mongoUserFindService.getUserCreditBalance(userId);
        const creditHistory: CreditHistory = {
          userId,
          scale: body.scale,
          balance: creditBalance + body.scale,
          isIncome: body.scale >= 0 ? true : false,
          reason: body.reason,
          type: body.type, // "PRODUCT_EXCHANGE"
          createdAt: getCurrentISOTime(),
        };
        await this.mongoUserCreateService.createCreditHistory(
          { userId, creditHistory },
          userSession,
        );
      }
    }, [userSession]);
  }

  /**
   * 리서치를 통합합니다.
   * 조회수, 스크랩수, 참여자수, (대)댓글을 통합합니다. 이 후 기존 리서치를 삭제합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/integrate")
  async integrateResearch(
    @Body() body: { oldResearchId: string; newResearchId: string },
  ) {
    const researchSession = await this.researchConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.mongoResearchUpdateService.updateResearchViews({
        filterQuery: { researchId: body.oldResearchId },
        updateQuery: { $set: { researchId: body.newResearchId } },
      });
      await this.mongoResearchUpdateService.updateResearchScraps(
        {
          filterQuery: { researchId: body.oldResearchId },
          updateQuery: { $set: { researchId: body.newResearchId } },
        },
        researchSession,
      );
      await this.mongoResearchUpdateService.updateResearchParticipations(
        {
          filterQuery: { researchId: body.oldResearchId },
          updateQuery: { $set: { researchId: body.newResearchId } },
        },
        researchSession,
      );
      await this.mongoResearchUpdateService.updateResearchComments(
        {
          filterQuery: { researchId: body.oldResearchId },
          updateQuery: { $set: { researchId: body.newResearchId } },
        },
        researchSession,
      );
      await this.mongoResearchUpdateService.updateResearchReplies(
        {
          filterQuery: { researchId: body.oldResearchId },
          updateQuery: { $set: { researchId: body.newResearchId } },
        },
        researchSession,
      );
      //* 리서치 삭제 후 해당 내용 가져오기
      const deletedResearch =
        await this.mongoResearchDeleteService.deleteResearchById(
          { researchId: body.oldResearchId },
          researchSession,
        );
      //* 수치 통합
      await this.mongoResearchUpdateService.updateResearch({
        researchId: body.newResearchId,
        updateQuery: {
          $inc: {
            viewsNum: deletedResearch.viewsNum,
            scrapsNum: deletedResearch.scrapsNum,
            participantsNum: deletedResearch.participantsNum,
            nonMemberParticipantsNum: deletedResearch.nonMemberParticipantsNum,
            commentsNum: deletedResearch.commentsNum,
          },
        },
        handleAsException: true,
      });
    }, [researchSession]);
  }

  /**
   * 리서치를 마감시킵니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/close")
  async closeResearch(@Body() body: { researchId: string }) {
    await this.researchUpdateService.closeResearch({
      userId: "",
      researchId: body.researchId,
      skipValidation: true,
    });
  }

  /**
   * 마감 기한이 지났지만 아직 마감되지 않은 모든 리서치를 마감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/close/all")
  async closeAllResearch() {
    const openedResearches =
      await this.mongoResearchFindService.getAllOpenedResearchWithDeadline();

    for (const research of openedResearches) {
      //* 마감일이 설정되어 있지 않은 리서치인 경우, 한번 더 걸러냅니다.
      if (!Boolean(research.deadline)) continue;
      //* 마감일이 지난 리서치인 경우, 리서치를 마감합니다.
      //* (크레딧 추첨도 내부적으로 처리됩니다)
      if (new Date(research.deadline) < new Date()) {
        await this.researchUpdateService.closeResearch({
          userId: "",
          researchId: research._id,
          skipValidation: true,
        });
      }
    }
  }

  /**
   * 추가 크레딧이 걸린 리서치 중에서 마감 기한이 지났거나, 마감되었지만
   * 크레딧이 분배되자 않은 리서치를 모두 찾아 크레딧을 분배합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/distribute/all")
  async distributeAllResearchCredits() {
    const undistributedResearches =
      await this.mongoResearchFindService.getResearches({
        filterQuery: {
          $or: [
            {
              $and: [
                { deadline: { $lt: getCurrentISOTime() } },
                { deadline: { $ne: "" } },
                { extraCredit: { $gt: 0 } },
                { creditDistributed: false },
              ],
            },
            {
              $and: [
                { deadline: { $eq: "" } },
                { closed: true },
                { extraCredit: { $gt: 0 } },
                { creditDistributed: false },
              ],
            },
          ],
        },
        selectQuery: {
          title: true,
          extraCredit: true,
          extraCreditReceiverNum: true,
        },
      });

    for (const research of undistributedResearches) {
      await this.researchUpdateService.distributeCredit({
        researchId: research._id.toString(),
        researchTitle: research.title,
        extraCredit: research.extraCredit,
        extraCreditReceiverNum: research.extraCreditReceiverNum,
      });
    }
  }

  /**
   * 리서치를 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/block")
  async blockResearch(@Body() body: ResearchBlockBodyDto) {
    return await this.mongoResearchUpdateService.updateResearch({
      researchId: body.researchId,
      updateQuery: { $set: { blocked: true } },
    });
  }

  /**
   * 리서치 댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/comments/block")
  async blockResearchComment(@Body() body: CommentBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearchComment(
      body.commentId,
    );
  }

  /**
   * 리서치 대댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("researches/replies/block")
  async blockResearchReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearchReply(
      body.replyId,
    );
  }

  /**
   * 투표를 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("votes/block")
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
  @Patch("votes/comments/block")
  async blockVoteComment(@Body() body: CommentBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteComment(body.commentId);
  }

  /**
   * 투표 대댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("votes/replies/block")
  async blockVoteReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoVoteUpdateService.blockVoteReply(body.replyId);
  }
}
