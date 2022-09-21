import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchUser,
  ResearchUserDocument,
  ResearchView,
  ResearchViewDocument,
} from "src/Schema";
import {
  AlreadyParticipatedResearchException,
  NotResearchAuthorException,
  ResearchNotFoundException,
  UnableToDeleteResearchException,
} from "src/Exception";

@Injectable()
export class MongoResearchFindService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,
  ) {}

  /**
   * 유저가 이미 리서치를 조회한 적이 있는지 확인합니다.
   * @author 현웅
   */
  async isUserAlreadyViewedResearch(param: {
    userId: string;
    researchId: string;
  }) {
    const researchView = await this.ResearchView.findOne({
      userId: param.userId,
      researchId: param.researchId,
    })
      .select({ _id: 1 })
      .lean();
    if (researchView) return true;

    return false;
  }

  /**
   * 유저가 이미 리서치에 참여한 적이 있는지 확인합니다.
   * 참여한 적이 있는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isUserAlreadyParticipatedResearch(param: {
    userId: string;
    researchId: string;
  }) {
    const researchParticipation = await this.ResearchParticipation.findOne({
      userId: param.userId,
      researchId: param.researchId,
    })
      .select({ _id: 1 })
      .lean();
    if (researchParticipation) throw new AlreadyParticipatedResearchException();
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * 단, skipValidation 이 true 인 경우 반드시 검증을 통과합니다.
   * @author 현웅
   */
  async isResearchAuthor(param: {
    userId: string;
    researchId: string;
    skipValidation?: boolean;
  }) {
    if (param.skipValidation === true) return;

    const research = await this.Research.findById(param.researchId)
      .select({ authorId: 1 })
      .sort({ _id: -1 })
      .lean();

    if (!research) throw new ResearchNotFoundException();
    if (research.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isResearchCommentAuthor(param: { userId: string; commentId: string }) {
    const researchComment = await this.ResearchComment.findById(param.commentId)
      .select({ authorId: 1 })
      .lean();
    if (researchComment.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 인자로 받은 유저 _id 가 리서치 대댓글 작성자 _id 와 일치하는지 확인합니다.
   * 일치하지 않는 경우, 에러를 발생시킵니다.
   * @author 현웅
   */
  async isResearchReplyAuthor(param: { userId: string; replyId: string }) {
    const researchReply = await this.ResearchReply.findById(param.replyId)
      .select({ authorId: 1 })
      .lean();
    if (researchReply.authorId !== param.userId) {
      throw new NotResearchAuthorException();
    }
    return;
  }

  /**
   * 리서치 참여자 수가 0명으로, 삭제 가능한지 확인합니다.
   * 0명이 아닌 경우 에러를 발생시킵니다.
   * @author 현웅
   */
  async isAbleToDeleteResearch(researchId: string) {
    const research = await this.Research.findById(researchId)
      .select({ participantsNum: 1 })
      .lean();

    if (!research) throw new ResearchNotFoundException();
    if (research.participantsNum !== 0) {
      throw new UnableToDeleteResearchException();
    }
    return;
  }

  /**
   * 최신 리서치를 원하는만큼 찾고 반환합니다.
   * @author 현웅
   */
  async getRecentResearches(get: number = 20) {
    return await this.Research.find()
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .limit(get) // 원하는 수만큼
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      // .select({})  //TODO: 원하는 property만
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 추천 리서치 7개를 반환합니다.
   * ! 추천 리서치 가장 앞에 리서치를 고정시키기 위해 현재 다소 변경이 있습니다.
   * @author 현웅
   */
  async getRecommendResearches() {
    const fixedResearch = await this.getResearchById({
      researchId: "63105952d00e56a36fcafe23",
    });
    const researches = await this.Research.find({
      // 마감일이 존재하고 마감되지 않은 리서치만 뽑은 후
      closed: false,
      deadline: { $gt: new Date().toISOString() },
    })
      .sort({
        participantsNum: 1, // 참여자 오름차순,
        deadline: 1, // 마감일 임박순으로 정렬하여
      })
      .limit(6) // 6개 추출
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean(); // data만 뽑아서 반환
    return [fixedResearch, ...researches];
  }
  // /**
  //  * 추천 리서치 7개를 반환합니다.
  //  * 우선 순위는 참여자가 하나도 없는 리서치
  //  * > 마감일이 임박한 리서치 입니다.
  //  * @author 현웅
  //  */
  // async getRecommendResearches() {
  //   return await this.Research.find({
  //     // 마감일이 존재하고 마감되지 않은 리서치만 뽑은 후
  //     closed: false,
  //     deadline: { $gt: new Date().toISOString() },
  //   })
  //     .sort({
  //       participantsNum: 1, // 참여자 오름차순,
  //       deadline: 1, // 마감일 임박순으로 정렬하여
  //     })
  //     .limit(7) // 7개 추출
  //     .populate({
  //       path: "author",
  //       model: this.ResearchUser,
  //     })
  //     .lean(); // data만 뽑아서 반환
  // }

  /**
   * 주어진 리서치 pulledupAt을 기준으로 하여 더 최근의 리서치를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getNewerResearches(pulledupAt: string) {
    return await this.Research.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 리서치 중
      pulledupAt: { $gt: pulledupAt }, // 주어진 pulledupAt 시기보다 더 나중에 끌올된 리서치 중에서
    })
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 리서치 pulledupAt을 기준으로 하여 과거의 리서치 20개를 찾고 반환합니다.
   * @author 현웅
   */
  async getOlderResearches(pulledupAt: string, limit: number = 20) {
    return await this.Research.find({
      hidden: false, // 숨겼거나
      blocked: false, // 차단되지 않은 리서치 중
      pulledupAt: { $lt: pulledupAt }, // 주어진 pulledupAt 시기보다 먼저 끌올된 리서치 중에서
    })
      .sort({ pulledupAt: -1 }) // 최신순 정렬 후
      .limit(limit) // 20개를 가져오고
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean(); // data만 뽑아서 반환
  }

  /**
   * 주어진 _id를 통해 리서치를 찾고 반환합니다.
   * selectQuery 를 사용하여 원하는 속성만 지정할 수도 있습니다.
   * @author 현웅
   */
  async getResearchById(param: {
    researchId: string;
    selectQuery?: Partial<Record<keyof Research, boolean>>;
  }) {
    const research = await this.Research.findById(param.researchId)
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .select(param.selectQuery)
      .lean();
    if (research) return research;
    return null;
  }

  /**
   * 특정 리서치의 (대)댓글을 모두 가져옵니다.
   * @author 현웅
   */
  async getResearchComments(researchId: string) {
    return await this.ResearchComment.find({ researchId })
      .populate([
        {
          path: "author",
          model: this.ResearchUser,
        },
        {
          path: "replies",
          model: this.ResearchReply,
          populate: {
            path: "author",
            model: this.ResearchUser,
          },
        },
      ])
      .sort({ _id: 1 })
      .lean();
  }

  /**
   * (리서치 모듈이 시작될 때 사용됩니다)
   * 마감일이 존재하면서 아직 마감되지 않은 모든 리서치들의 _id 와 마감일 정보를 가져옵니다.
   * @author 현웅
   */
  async getAllOpenedResearchWithDeadline() {
    return await this.Research.find({
      closed: false,
      deadline: { $ne: "" },
    })
      .sort({ _id: 1 })
      .select({ deadline: true })
      .lean();
  }

  /**
   * 인자로 받은 researchIds 로 리서치를 모두 찾고 반환합니다.
   * @author 현웅
   */
  async getResearchesById(researchIds: string[]) {
    //* Mongoose 의 $in 을 사용하면 입력 순서가 보장되지 않고 _id 를 기준으로 오름차순하여 반환되므로
    //* 아래 답변을 참고하여 최초로 주어진 _id 를 기준으로 정렬한 후 반환
    //* https://stackoverflow.com/questions/35538509/sort-an-array-of-objects-based-on-another-array-of-ids
    const researches = await this.Research.find({
      _id: { $in: researchIds },
    })
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();

    return researches.sort((a, b) => {
      return (
        researchIds.indexOf(a._id.toString()) -
        researchIds.indexOf(b._id.toString())
      );
    });
  }

  /**
   * 특정 유저가 조회한 리서치 조회 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserResearchViews(userId: string) {
    return await this.ResearchView.find({ userId }).sort({ _id: -1 }).lean();
  }

  /**
   * 특정 유저가 스크랩한 리서치 스크랩 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserResearchScraps(userId: string) {
    return await this.ResearchScrap.find({ userId }).sort({ _id: -1 }).lean();
  }

  /**
   * 특정 유저가 참여한 리서치 참여 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserResearchParticipations(userId: string) {
    return await this.ResearchParticipation.find({ userId })
      .sort({ _id: -1 })
      .lean();
  }

  /**
   * 특정 리서치 참여 정보를 가져옵니다.
   * selectQuery 를 이용하여 원하는 속성만 지정할 수도 있습니다.
   * @author 현웅
   */
  async getResearchParticipations(param: {
    filterQuery?: FilterQuery<ResearchParticipationDocument>;
    selectQuery?: Partial<Record<keyof ResearchParticipation, boolean>>;
  }) {
    return await this.ResearchParticipation.find(param.filterQuery)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저가 업로드한 리서치를 가져옵니다.
   * @author 현웅
   */
  async getUploadedResearches(userId: string) {
    return await this.Research.find({
      authorId: userId,
    })
      .sort({ pulledupAt: -1 })
      .limit(20)
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }

  /**
   * 인자로 받은 userId 가 업로드한 리서치 중
   * 인자로 받은 pulledupAt 이전의 리서치를 가져옵니다.
   * @author 현웅
   */
  async getOlderUploadedResearches(param: {
    userId: string;
    pulledupAt: string;
  }) {
    return await this.Research.find({
      authorId: param.userId,
      pulledupAt: { $lt: param.pulledupAt },
    })
      .sort({ pulledupAt: -1 })
      .limit(20)
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
  }
}
