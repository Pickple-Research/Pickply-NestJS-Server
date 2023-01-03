import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  Vote,
  VoteDocument,
  VoteComment,
  VoteCommentDocument,
  VoteParticipation,
  VoteParticipationDocument,
  VoteNonMemberParticipation,
  VoteNonMemberParticipationDocument,
  VoteReply,
  VoteReplyDocument,
  VoteScrap,
  VoteScrapDocument,
  VoteStatTicket,
  VoteStatTicketDocument,
  VoteUser,
  VoteUserDocument,
  VoteView,
  VoteViewDocument,
} from "src/Schema";
import { AllVoteCategory } from "src/Object/Enum";
import { VoteNotFoundException } from "src/Exception";

@Injectable()
export class MongoVoteFindService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteNonMemberParticipation.name)
    private readonly VoteNonMemberParticipation: Model<VoteNonMemberParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteScrap.name)
    private readonly VoteScrap: Model<VoteScrapDocument>,
    @InjectModel(VoteStatTicket.name)
    private readonly VoteStatTicket: Model<VoteStatTicketDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
    @InjectModel(VoteView.name)
    private readonly VoteView: Model<VoteViewDocument>,
  ) {}

  // ********************************** //
  /** Analytics용 **/
  // ********************************** //

  /**
   * 최근 n일간 가장 참여가 많았던 투표를 가져옵니다.
   * @author 현웅
   */
  async getLastDayHotVote(day: number = 5) {
    const lastDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * day);
    lastDay.setHours(0, 0, 0, 0);
    const recentParticipations = await this.VoteParticipation.find({
      createdAt: { $gte: lastDay.toISOString() },
    }).lean();

    const voteIds = recentParticipations.map(
      (participation) => participation.voteId,
    );

    const voteIdOccurrences: { voteId: string; occur: number }[] = [];
    for (const voteId of voteIds) {
      const idIndex = voteIdOccurrences.findIndex(
        (occur) => occur.voteId === voteId,
      );
      if (idIndex === -1) {
        voteIdOccurrences.push({ voteId, occur: 1 });
      } else {
        voteIdOccurrences[idIndex].occur++;
      }
    }

    voteIdOccurrences.sort((a, b) => b.occur - a.occur);
    return await this.getVoteById(voteIdOccurrences[0].voteId);
  }

  /**
   * 비회원의 투표 참여 수를 반환합니다.
   * @author 현웅
   */
  async getNonMemberVoteParticipations() {
    return await this.Vote.aggregate([
      { $match: {} },
      { $group: { _id: null, result: { $sum: "$nonMemberParticipantsNum" } } },
    ]);
  }

  // ********************************** //
  /** 기본형 **/
  // ********************************** //

  /**
   *
   * @link https://jaehun2841.github.io/2019/02/24/2019-02-24-mongodb-2/#addField
   * @author 승원
   * @modify 현웅
   */
  async getResultNumber() {
    return await this.Vote.aggregate([
      {
        $addFields: {
          totalMemberResult: { $sum: "$result" }, //회원이 투표한 결과 더해서 저장
          totalNonMemberResult: { $sum: "$nonMemeberResult" }, //비회원이 투표한 결과 더해서 저장
        },
      },
      {
        $addFields: {
          totalResult: {
            $add: ["$totalMemberResult", "$totalNonMemberResult"],
          }, //회원, 비회원 투표 결과 더해서 저장
        },
      },

      {
        $group: {
          _id: null,
          resultNumber: {
            $sum: "$totalResult", //모든 투표 결과 더해서 반환
          },
        },
      },
    ]);
  }

  /**
   * 투표를 원하는 조건으로 검색합니다.
   *
   * - 기본적으로 author 부분은 populate 합니다.
   * - 정렬 기준이 주어지지 않는 경우, _id 를 기준으로 내림차순 정렬하여 반환합니다.
   * - GREEN_LIGHT 투표는 게시자를 익명으로 바꿔서 반환합니다.
   * @author 현웅
   */
  async getVotes(param: {
    filterQuery?: FilterQuery<VoteDocument>;
    selectQuery?: Partial<Record<keyof Vote, boolean>>;
    limit?: number;
  }) {
    const votes = await this.Vote.find(param.filterQuery)
      .populate({ path: "author", model: this.VoteUser })
      .select(param.selectQuery)
      .limit(param.limit)
      .sort({ _id: -1 })
      .lean();
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
  }

  async getVoteById(
    voteId: string,
    selectQuery?: Partial<Record<keyof Vote, boolean>>,
  ) {
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const vote = await this.Vote.findById(voteId)
      .populate({ path: "author", model: this.VoteUser })
      .select(selectQuery)
      .lean();
    if (!vote) throw new VoteNotFoundException();
    if (vote.category !== "GREEN_LIGHT") return vote;
    return { ...vote, author: { ...vote.author, nickname: "익명" } };
  }

  /**
   * 인자로 받은 voteIds 로 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getVotesByIds(voteIds: string[]) {
    const votes = await this.getVotes({
      filterQuery: { _id: { $in: voteIds }, hidden: false, blocked: false },
    });

    return votes.sort((a, b) => {
      return (
        voteIds.indexOf(a._id.toString()) - voteIds.indexOf(b._id.toString())
      );
    });
  }

  /**
   * 투표 조회 정보를 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getVoteViews(param: {
    filterQuery?: FilterQuery<VoteViewDocument>;
    selectQuery?: Partial<Record<keyof VoteView, boolean>>;
    limit?: number;
  }) {
    return await this.VoteView.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  /**
   * 투표 스크랩 정보를 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getVoteScraps(param: {
    filterQuery?: FilterQuery<VoteScrapDocument>;
    selectQuery?: Partial<Record<keyof VoteScrap, boolean>>;
    limit?: number;
  }) {
    return await this.VoteScrap.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  /**
   * 투표 결과 통계 조회권 정보를 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getVoteStatTickets(param: {
    filterQuery?: FilterQuery<VoteStatTicketDocument>;
    selectQuery?: Partial<Record<keyof VoteStatTicket, boolean>>;
    limit?: number;
  }) {
    return await this.VoteStatTicket.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  /**
   * 투표 참여 정보를 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getVoteParticipations(param: {
    filterQuery?: FilterQuery<VoteParticipationDocument>;
    selectQuery?: Partial<Record<keyof VoteParticipation, boolean>>;
    limit?: number;
  }) {
    return await this.VoteParticipation.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  // ********************************** //
  /** 활용형 **/
  // ********************************** //

  /**
   * 투표 리스트 상단에 고정할 투표를 반환합니다.
   * @author 현웅
   */
  async getFixedVotes() {
    //* 고정 투표 _id 목록
    // return await this.getVotes({
    //   filterQuery: { _id: { $in: [""] } },
    // });

    //* 고정 투표가 없는 경우
    return [];
  }

  /**
   * 최신 투표를 가져옵니다. 인자가 주어지지 않으면 20개를 가져옵니다.
   * analytics 데이터는 제외하고 가져옵니다.
   * @author 현웅
   */
  async getRecentVotes(limit: number = 20) {
    return await this.getVotes({
      filterQuery: { hidden: false, blocked: false },
      selectQuery: { analytics: false },
      limit,
    });
  }

  /**
   * 각 카테고리별 최신 투표를 하나씩 가져옵니다.
   * analytics 데이터는 제외하고 가져옵니다.
   * @author 현웅
   */
  async getRecentCategoryVotes() {
    const votes = await Promise.all(
      AllVoteCategory.map((category) => {
        return this.Vote.findOne({ category, hidden: false, blocked: false })
          .select({ analytics: false })
          .sort({ _id: -1 })
          .populate({ path: "author", model: this.VoteUser })
          .lean();
      }),
    );
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    return votes
      .filter((vote) => vote !== null)
      .map((vote) => {
        if (vote.category !== "GREEN_LIGHT") return vote;
        return { ...vote, author: { ...vote.author, nickname: "익명" } };
      });
  }

  /**
   * HOT 투표 3개를 가져옵니다.
   * 기준은 최근 100건의 투표 참여 중 제일 많은 참여를 이끌어낸 투표입니다.
   * @author 현웅
   */
  async getHotVotes() {
    const recentParticipations = await this.getVoteParticipations({
      selectQuery: { voteId: true },
      limit: 100,
    });
    const voteIds = recentParticipations.map(
      (participation) => participation.voteId,
    );

    const voteIdOccurrences: { voteId: string; occur: number }[] = [];
    for (const voteId of voteIds) {
      const idIndex = voteIdOccurrences.findIndex(
        (occur) => occur.voteId === voteId,
      );
      if (idIndex === -1) {
        voteIdOccurrences.push({ voteId, occur: 1 });
      } else {
        voteIdOccurrences[idIndex].occur++;
      }
    }

    voteIdOccurrences.sort((a, b) => b.occur - a.occur);
    return await this.getVotesByIds(
      voteIdOccurrences.slice(0, 3).map((occurence) => occurence.voteId),
    );
  }

  /**
   * 투표 (대)댓글을 모두 가져옵니다.
   * @author 현웅
   */
  async getVoteComments(voteId: string) {
    const comments = await this.VoteComment.find({ voteId })
      .populate([
        {
          path: "author",
          model: this.VoteUser,
        },
        {
          path: "replies",
          model: this.VoteReply,
          populate: {
            path: "author",
            model: this.VoteUser,
          },
        },
      ])
      .sort({ _id: 1 })
      .lean();

    if (!Boolean(comments.length)) return [];

    const vote = await this.getVoteById(voteId, {
      category: true,
      commentedUserIds: true,
    });
    if (vote.category !== "GREEN_LIGHT") return comments;

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const anonymizedComments = [];
    comments.forEach((comment, commentIndex) => {
      comment.author.nickname = `익명 ${
        vote.commentedUserIds.indexOf(comment.authorId) + 1
      }`;
      anonymizedComments.push(comment);
      comment.replies.forEach((reply, replyIndex) => {
        anonymizedComments[commentIndex].replies[
          replyIndex
        ].author.nickname = `익명 ${
          vote.commentedUserIds.indexOf(reply.authorId) + 1
        }`;
      });
    });
    return anonymizedComments;
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getNewerVotes(voteId: string) {
    return await this.getVotes({
      filterQuery: {
        hidden: false,
        blocked: false,
        _id: { $gt: voteId },
      },
    });
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 20개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderVotes(voteId: string, limit: number = 20) {
    return await this.getVotes({
      filterQuery: {
        hidden: false, // 숨겼거나
        blocked: false, // 차단되지 않은 투표 중
        _id: { $lt: voteId }, // 주어진 voteId 보다 먼저 업로드된 투표 중에서
      },
      limit,
    });
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저가 업로드한 투표를 20개 가져옵니다.
   * @author 현웅
   */
  async getUploadedVotes(userId: string) {
    return await this.getVotes({
      filterQuery: { authorId: userId },
      limit: 20,
    });
  }

  /**
   * 인자로 받은 userId 가 업로드한 투표 중
   * 인자로 받은 voteId 이전의 투표를 가져옵니다.
   * @author 현웅
   */
  async getOlderUploadedVotes(param: { userId: string; voteId: string }) {
    return await this.getVotes({
      filterQuery: {
        _id: { $lt: param.voteId },
        authorId: param.userId,
      },
      limit: 20,
    });
  }

  /**
   * 특정 유저가 조회한 투표 조회 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteViews(userId: string) {
    return await this.getVoteViews({
      filterQuery: { userId },
      selectQuery: { voteId: true },
    });
  }

  /**
   * 특정 유저가 스크랩한 투표 스크랩 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteScraps(userId: string) {
    return await this.getVoteScraps({
      filterQuery: { userId },
      selectQuery: { voteId: true },
    });
  }

  /**
   * 특정 유저가 가진 투표 결과 통계 조회권을 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteStatTickets(userId: string) {
    return await this.getVoteStatTickets({
      filterQuery: { userId },
      selectQuery: { voteId: true },
    });
  }

  /**
   * 특정 유저가 참여한 투표 참여 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteParticipations(userId: string) {
    return await this.getVoteParticipations({
      filterQuery: { userId },
      selectQuery: { voteId: true, selectedOptionIndexes: true },
    });
  }

  /**
   * 주어진 userId 와 voteId 를 기반으로 투표 참여 정보를 하나 가져옵니다.
   * @author 현웅
   */
  async getVoteParticipation(param: { userId: string; voteId: string }) {
    return await this.getVoteParticipations({
      filterQuery: {
        userId: param.userId,
        voteId: param.voteId,
      },
    });
  }
}
