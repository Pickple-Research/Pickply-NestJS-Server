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
export class MongoVoteValidateService {
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
}
