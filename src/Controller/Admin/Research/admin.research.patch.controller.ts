import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Roles } from "src/Security/Metadata";
import { ResearchUpdateService } from "src/Service";
import {
  MongoResearchFindService,
  MongoResearchUpdateService,
  MongoResearchDeleteService,
} from "src/Mongo";
import {
  ResearchBlockBodyDto,
  CommentBlockBodyDto,
  ReplyBlockBodyDto,
} from "src/Dto";
import { UserType } from "src/Object/Enum";
import { tryMultiTransaction, getCurrentISOTime } from "src/Util";
import { MONGODB_RESEARCH_CONNECTION } from "src/Constant";

/**
 * 관리자만 사용하는, 리서치 정보 수정 관련 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/researches")
export class AdminResearchPatchController {
  constructor(
    private readonly researchUpdateService: ResearchUpdateService,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;

  /**
   * 리서치 정보를 수정합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("")
  async editResearch() {}

  /**
   * 리서치에 참여합니다. 리서치 참여 정보는 만들지 않고, 관리자 참여자 수만 증가시킵니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("check")
  async checkResearch(@Body() body: { researchId: string }) {
    return await this.mongoResearchUpdateService.updateResearchById({
      researchId: body.researchId,
      updateQuery: { $inc: { adminParticipantsNum: 1 } },
    });
  }

  /**
   * 리서치를 승인/승인 취소합니다.
   * TODO: 승인되는 경우 리서치 작성자에게 알림이 전송됩니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("confirm")
  async confirmResearch(
    @Body() body: { researchId: string; confirmed: boolean },
  ) {
    return await this.mongoResearchUpdateService.updateResearchById({
      researchId: body.researchId,
      updateQuery: { $set: { confirmed: body.confirmed } },
    });
  }

  /**
   * 리서치를 통합합니다.
   * 조회수, 스크랩수, 참여자수, (대)댓글을 통합합니다. 이 후 기존 리서치를 삭제합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("integrate")
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
      await this.mongoResearchUpdateService.updateResearchById({
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
  @Patch("close")
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
  @Patch("close/all")
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
  @Patch("distribute/all")
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
  @Patch("block")
  async blockResearch(@Body() body: ResearchBlockBodyDto) {
    return await this.mongoResearchUpdateService.updateResearchById({
      researchId: body.researchId,
      updateQuery: { $set: { blocked: true } },
    });
  }

  /**
   * 리서치 댓글을 블락처리합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("comments/block")
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
  @Patch("replies/block")
  async blockResearchReply(@Body() body: ReplyBlockBodyDto) {
    return await this.mongoResearchUpdateService.blockResearchReply(
      body.replyId,
    );
  }
}
