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
  VoteReply,
  VoteReplyDocument,
  VoteScrap,
  VoteScrapDocument,
  VoteUser,
  VoteUserDocument,
  VoteView,
  VoteViewDocument,
} from "src/Schema";
import { AllVoteCategory } from "src/Object/Enum";
import {
  AlreadyParticipatedVoteException,
  NotVoteAuthorException,
  UnableToDeleteVoteException,
  SelectedOptionInvalidException,
  VoteNotFoundException,
} from "src/Exception";

@Injectable()
export class MongoVoteFindService {
  constructor(
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteComment.name)
    private readonly VoteComment: Model<VoteCommentDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
    @InjectModel(VoteReply.name)
    private readonly VoteReply: Model<VoteReplyDocument>,
    @InjectModel(VoteScrap.name)
    private readonly VoteScrap: Model<VoteScrapDocument>,
    @InjectModel(VoteUser.name)
    private readonly VoteUser: Model<VoteUserDocument>,
    @InjectModel(VoteView.name)
    private readonly VoteView: Model<VoteViewDocument>,
  ) {}

  /**
   * 주어진 조건에 맞는 투표를 모두 반환합니다.
   * 기본적으로 _id 를 기준으로 내림차순 정렬합니다.
   * @author 현웅
   */
  async getVotes(param: {
    filterQuery?: FilterQuery<VoteDocument>;
    selectQuery?: Partial<Record<keyof Vote, boolean>>;
  }) {
    const votes = await this.Vote.find(param.filterQuery)
      .populate({ path: "author", model: this.VoteUser })
      .select({ _id: 1, ...param.selectQuery })
      .lean();
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
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

  /**
   * 유저가 이미 투표를 조회한 적이 있는지 확인합니다.
   * @author 현웅
   */
  async isUserAlreadyViewedVote(param: { userId: string; voteId: string }) {
    const voteView = await this.VoteView.findOne({
      userId: param.userId,
      voteId: param.voteId,
    })
      .select({ _id: 1 })
      .lean();
    if (voteView) return true;
    return false;
  }

  /**
   * 유저가 이미 투표에 참여한 적이 있는지 확인합니다.
   * 참여한 적이 있는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isUserAlreadyParticipatedVote(param: {
    userId: string;
    voteId: string;
  }) {
    const voteParticipation = await this.VoteParticipation.findOne({
      userId: param.userId,
      voteId: param.voteId,
    })
      .select({ _id: 1 })
      .lean();
    if (voteParticipation) throw new AlreadyParticipatedVoteException();
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 투표 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isVoteAuthor(param: { userId: string; voteId: string }) {
    const vote = await this.Vote.findById(param.voteId)
      .select({ authorId: 1 })
      .lean();
    if (vote.authorId !== param.userId) {
      throw new NotVoteAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 투표 댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isVoteCommentAuthor(param: { userId: string; commentId: string }) {
    const voteComment = await this.VoteComment.findById(param.commentId)
      .select({ authorId: 1 })
      .lean();
    if (voteComment.authorId !== param.userId) {
      throw new NotVoteAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 투표 대댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isVoteReplyAuthor(param: { userId: string; replyId: string }) {
    const voteReply = await this.VoteReply.findById(param.replyId)
      .select({ authorId: 1 })
      .lean();
    if (voteReply.authorId !== param.userId) {
      throw new NotVoteAuthorException();
    }
    return;
  }

  /**
   * 투표 참여자 수가 10명 미만으로, 삭제 가능한지 확인합니다.
   * 10명 이상인 경우 에러를 발생시킵니다.
   * @author 현웅
   */
  async isAbleToDeleteVote(voteId: string) {
    const vote = await this.Vote.findById(voteId)
      .select({ participantsNum: 1 })
      .lean();
    if (!vote) throw new VoteNotFoundException();
    if (vote.participantsNum >= 10) {
      throw new UnableToDeleteVoteException();
    }
    return;
  }

  /**
   * 최신 투표를 가져옵니다. 인자가 주어지지 않으면 20개를 가져옵니다.
   * @author 현웅
   */
  async getRecentVotes(limit: number = 20) {
    // return await this.Vote.find({ hidden: false, blocked: false })
    //   .sort({ _id: -1 })
    //   .limit(limit)
    //   .populate({
    //     path: "author",
    //     model: this.VoteUser,
    //   })
    //   .lean();

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const votes = await this.Vote.find({ hidden: false, blocked: false })
      .sort({ _id: -1 })
      .limit(limit)
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    return votes.map((vote) => {
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
    const recentParticipations = await this.VoteParticipation.find()
      .sort({ _id: -1 })
      .limit(100)
      .select({ voteId: 1 })
      .lean();

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
   * 각 카테고리별 최신 투표를 하나씩 가져옵니다
   * @author 현웅
   */
  async getRecentCategoryVotes() {
    const votes = await Promise.all(
      AllVoteCategory.map((category) => {
        return this.Vote.findOne({ category })
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
   * 주어진 투표 _id을 기준으로 하여 더 최근의 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getNewerVotes(voteId: string) {
    // return await this.Vote.find({
    //   hidden: false, // 숨겼거나
    //   blocked: false, // 차단되지 않은 투표 중
    //   _id: { $gt: voteId }, // 주어진 voteId 보다 더 나중에 업로드된 투표 중에서
    // })
    //   .sort({ _id: -1 }) // 최신순 정렬 후
    //   .populate({ path: "author", model: this.VoteUser })
    //   .lean(); // data만 뽑아서 반환

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const votes = await this.Vote.find({
      hidden: false,
      blocked: false,
      _id: { $gt: voteId },
    })
      .sort({ _id: -1 })
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
  }

  /**
   * 주어진 투표 _id을 기준으로 하여 과거의 투표 20개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderVotes(voteId: string, limit: number = 20) {
    // return await this.Vote.find({
    //   hidden: false, // 숨겼거나
    //   blocked: false, // 차단되지 않은 투표 중
    //   _id: { $lt: voteId }, // 주어진 voteId 보다 먼저 업로드된 투표 중에서
    // })
    //   .sort({ _id: -1 }) // 최신순 정렬 후
    //   .limit(limit) // 20개를 가져오고
    //   .populate({ path: "author", model: this.VoteUser })
    //   .lean(); // data만 뽑아서 반환

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const votes = await this.Vote.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 투표 중
      _id: { $lt: voteId }, // 주어진 voteId 보다 먼저 업로드된 투표 중에서
    })
      .sort({ _id: -1 }) // 최신순 정렬 후
      .limit(limit) // 20개를 가져오고
      .populate({ path: "author", model: this.VoteUser })
      .lean(); // data만 뽑아서 반환
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
  }

  async getVoteById(
    voteId: string,
    selectQuery?: Partial<Record<keyof Vote, boolean>>,
  ) {
    // return await this.Vote.findById(voteId)
    //   .populate({ path: "author", model: this.VoteUser })
    //   .select(selectQuery)
    //   .lean();

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
   * 투표 (대)댓글을 모두 가져옵니다.
   * @author 현웅
   */
  async getVoteComments(voteId: string) {
    // return await this.VoteComment.find({ voteId })
    //   .populate([
    //     {
    //       path: "author",
    //       model: this.VoteUser,
    //     },
    //     {
    //       path: "replies",
    //       model: this.VoteReply,
    //       populate: {
    //         path: "author",
    //         model: this.VoteUser,
    //       },
    //     },
    //   ])
    //   .sort({ _id: 1 })
    //   .lean();

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
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
   * 투표에 참여할 때, 전달된 선택지 index가 유효한 범위 내에 있는지 확인합니다.
   * @author 현웅
   */
  async isOptionIndexesValid(voteId: string, selectedOptionIndexes: number[]) {
    const vote = await this.Vote.findById(voteId).select({ options: 1 }).lean();

    if (!vote) throw new VoteNotFoundException();

    if (Math.max(...selectedOptionIndexes) >= vote.options.length) {
      throw new SelectedOptionInvalidException();
    }

    return;
  }

  /**
   * 인자로 받은 voteIds 로 투표를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getVotesByIds(voteIds: string[]) {
    const votes = await this.Vote.find({ _id: { $in: voteIds } })
      .populate({ path: "author", model: this.VoteUser })
      .lean();

    // return votes.sort((a, b) => {
    //   return (
    //     voteIds.indexOf(a._id.toString()) - voteIds.indexOf(b._id.toString())
    //   );
    // });
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    return votes
      .sort((a, b) => {
        return (
          voteIds.indexOf(a._id.toString()) - voteIds.indexOf(b._id.toString())
        );
      })
      .map((vote) => {
        if (vote.category !== "GREEN_LIGHT") return vote;
        return { ...vote, author: { ...vote.author, nickname: "익명" } };
      });
  }

  /**
   * 특정 유저가 조회한 투표 조회 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteViews(userId: string) {
    return await this.VoteView.find({ userId }).sort({ _id: -1 }).lean();
  }

  /**
   * 특정 유저가 스크랩한 투표 스크랩 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteScraps(userId: string) {
    return await this.VoteScrap.find({ userId }).sort({ _id: -1 }).lean();
  }

  /**
   * 특정 유저가 참여한 투표 참여 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserVoteParticipations(userId: string) {
    return await this.VoteParticipation.find({ userId })
      .sort({ _id: -1 })
      .lean();
  }

  /**
   * 주어진 userId 와 voteId 를 기반으로 투표 참여 정보를 하나 가져옵니다.
   * @author 현웅
   */
  async getVoteParticipation(param: { userId: string; voteId: string }) {
    return await this.VoteParticipation.find({
      userId: param.userId,
      voteId: param.voteId,
    }).lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저가 업로드한 투표를 가져옵니다.
   * @author 현웅
   */
  async getUploadedVotes(userId: string) {
    // return await this.Vote.find({ authorId: userId })
    //   .sort({ _id: -1 })
    //   .limit(20)
    //   .populate({ path: "author", model: this.VoteUser })
    //   .lean();

    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const votes = await this.Vote.find({ authorId: userId })
      .sort({ _id: -1 })
      .limit(20)
      .populate({ path: "author", model: this.VoteUser })
      .lean();
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
  }

  /**
   * 인자로 받은 userId 가 업로드한 투표 중
   * 인자로 받은 voteId 이전의 투표를 가져옵니다.
   * @author 현웅
   */
  async getOlderUploadedVotes(param: { userId: string; voteId: string }) {
    // return await this.Vote.find({
    //   _id: { $lt: param.voteId },
    //   authorId: param.userId,
    // })
    //   .sort({ _id: -1 })
    //   .limit(20)
    //   .populate({
    //     path: "author",
    //     model: this.VoteUser,
    //   })
    //   .lean();
    //! 그린라이트 투표는 게시자를 익명으로 바꿔서 반환합니다.
    const votes = await this.Vote.find({
      _id: { $lt: param.voteId },
      authorId: param.userId,
    })
      .sort({ _id: -1 })
      .limit(20)
      .populate({
        path: "author",
        model: this.VoteUser,
      })
      .lean();
    return votes.map((vote) => {
      if (vote.category !== "GREEN_LIGHT") return vote;
      return { ...vote, author: { ...vote.author, nickname: "익명" } };
    });
  }
}
