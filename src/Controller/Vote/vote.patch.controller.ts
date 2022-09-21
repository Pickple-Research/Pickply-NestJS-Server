import { Controller, Inject, Request, Body, Patch } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { VoteUpdateService } from "src/Service";
import { MongoUserUpdateService, MongoVoteUpdateService } from "src/Mongo";
import { VoteView, VoteScrap, VoteParticipation } from "src/Schema";
import { Public } from "src/Security/Metadata";
import {
  VoteInteractBodyDto,
  VoteParticipateBodyDto,
  VoteEditBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { MONGODB_VOTE_CONNECTION } from "src/Constant";

@Controller("votes")
export class VotePatchController {
  constructor(
    private readonly voteUpdateService: VoteUpdateService,

    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * @Transaction
   * 투표를 수정합니다.
   * 수정할 수 있는 범위는 제목과 내용으로 제한되며,
   * 수정을 요청한 유저가 투표 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 수정된 투표 정보
   * @author 현웅
   */
  @Patch("")
  async editVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteEditBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await this.voteUpdateService.editVote(
      { userId: req.user.userId, voteId: body.voteId, vote: body },
      voteSession,
    );
  }

  /**
   * 투표를 조회합니다.
   * 투표 조회를 요청한 유저가 이미 투표를 조회한 적이 있는 경우엔 아무 작업도 하지 않습니다.
   * @author 현웅
   */
  @Patch("view")
  async viewVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteInteractBodyDto,
  ) {
    const voteView: VoteView = {
      userId: req.user.userId,
      voteId: body.voteId,
      createdAt: getCurrentISOTime(),
    };

    return await this.voteUpdateService.viewVote({ voteView });
  }

  /**
   * 투표를 스크랩합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 스크랩 정보
   * @author 현웅
   */
  @Patch("scrap")
  async scrapVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteInteractBodyDto,
  ) {
    const voteScrap: VoteScrap = {
      userId: req.user.userId,
      voteId: body.voteId,
      createdAt: getCurrentISOTime(),
    };

    const { updatedVote, newVoteScrap } =
      await this.voteUpdateService.scrapVote({
        voteId: body.voteId,
        voteScrap,
      });
    return { updatedVote, newVoteScrap };
  }

  /**
   * 투표 스크랩을 취소합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  @Patch("unscrap")
  async unscrapVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteInteractBodyDto,
  ) {
    const updatedVote = await this.voteUpdateService.unscrapVote({
      userId: req.user.userId,
      voteId: body.voteId,
    });
    return updatedVote;
  }

  /**
   * @Transaction
   * 투표에 참여합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 참여 정보
   * @author 현웅
   */
  @Patch("participate")
  async participateVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteParticipateBodyDto,
  ) {
    //* 투표 참여 정보
    const voteParticipation: VoteParticipation = {
      userId: req.user.userId,
      voteId: body.voteId,
      selectedOptionIndexes: body.selectedOptionIndexes,
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
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  @Public()
  @Patch("participate/public")
  async nonMemberParticipateVote(@Body() body: VoteParticipateBodyDto) {
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      const updatedVote = await this.voteUpdateService.nonMemberParticipateVote(
        {
          voteId: body.voteId,
          selectedOptionIndexes: body.selectedOptionIndexes,
        },
        voteSession,
      );
      return updatedVote;
    }, [voteSession]);
  }

  /**
   * @Transaction
   * 투표를 마감합니다.
   * @return 마감된 투표 정보
   * @author 현웅
   */
  @Patch("close")
  async closeVote(
    @Request() req: { user: JwtUserInfo },
    @Body() body: VoteInteractBodyDto,
  ) {
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      const updatedVote = await this.voteUpdateService.closeVote(
        { userId: req.user.userId, voteId: body.voteId },
        voteSession,
      );
      return updatedVote;
    }, [voteSession]);
  }
}
