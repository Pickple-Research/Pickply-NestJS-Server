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
  ResearchNonMemberParticipation,
  ResearchNonMemberParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchUser,
  ResearchUserDocument,
  ResearchView,
  ResearchViewDocument,
} from "src/Schema";

@Injectable()
export class MongoResearchFindService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchNonMemberParticipation.name)
    private readonly ResearchNonMemberParticipation: Model<ResearchNonMemberParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,
  ) {}

  // ********************************** //
  /** 기본형 **/
  // ********************************** //

  /**
   *
   * @author 승원
   */
  async getResearchNumber() {
    return await this.Research.count();
  }

  /**
   * 리서치에 참여한 사람의 숫자를 모두 더해서 반환
   * @author 승원
   * @modify 현웅
   */

  async getParticipantsNumber() {
    const totalParticipantsNumber =
      (await this.ResearchParticipation.count()) +
      (await this.ResearchNonMemberParticipation.count());
    return [
      {
        _id: null,
        totalParticipantsNumber,
      },
    ];
  }

  /**
   * 리서치를 원하는 조건으로 검색합니다.
   * 반복되는 populate, lean 문구의 중복 사용을 줄이기 위해 MongoResearchFindService 내부적으로 사용되는 함수로, 외부에서 사용하는 것은 지양합니다.
   *
   * - 기본적으로 author 부분은 populate 합니다.
   * - 정렬 기준이 주어지지 않는 경우, pulledupAt 을 기준으로 내림차순 정렬하여 반환합니다.
   * @author 현웅
   */
  async getResearches(param: {
    filterQuery?: FilterQuery<ResearchDocument>;
    sort?: Partial<Record<keyof Research, 1 | -1>>;
    limit?: number;
    selectQuery?: Partial<Record<keyof Research, boolean>>;
  }) {
    return await this.Research.find(param.filterQuery)
      .sort(param.sort ? param.sort : { pulledupAt: -1 })
      .limit(param.limit)
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .select(param.selectQuery)
      .lean();
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
    return await this.ResearchView.find({ userId })
      .sort({ _id: -1 })
      .select({ researchId: true })
      .lean();
  }

  /**
   * 특정 유저가 스크랩한 리서치 스크랩 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserResearchScraps(userId: string) {
    return await this.ResearchScrap.find({ userId })
      .sort({ _id: -1 })
      .select({ researchId: true })
      .lean();
  }

  /**
   * 특정 유저가 참여한 리서치 참여 정보를 모두 가져옵니다.
   * @author 현웅
   */
  async getUserResearchParticipations(userId: string) {
    return await this.ResearchParticipation.find({ userId })
      .sort({ _id: -1 })
      .select({ researchId: true })
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

  // ********************************** //
  /** 활용형 **/
  // ********************************** //

  /** 최신 리서치를 20개 찾고 반환합니다. */
  async getRecentResearches() {
    return await this.getResearches({
      filterQuery: {
        hidden: false, // 숨겼거나
        blocked: false, // 차단되지 않은 리서치 중
      },
      limit: 20, // 최근 20개만
    });
  }

  /**
   * 추천 리서치를 반환합니다.
   * @author 현웅
   */
  async getRecommendResearches() {
    const fixedResearch = await this.getResearchById({
      researchId: "63105952d00e56a36fcafe23",
    });
    const researches = await this.getResearches({
      filterQuery: {
        // 마감일이 존재하고 숨기거나 마감되지 않은 리서치만 뽑은 후
        hidden: false,
        closed: false,
        deadline: { $gt: new Date().toISOString() },
      },
      sort: {
        participantsNum: 1, // 참여자 오름차순,
        deadline: 1, // 마감일 임박순으로 정렬하여
      },
      limit: 6, // 6개 추출
    });
    return [fixedResearch, ...researches];
  }

  /** 인자로 받은 pulledupAt 보다 나중에 끌올된 리서치를 가져옵니다. */
  async getNewerResearches(param: { pulledupAt: string }) {
    return await this.getResearches({
      filterQuery: {
        hidden: false, // 숨겼거나
        blocked: false, // 차단되지 않은 리서치 중
        pulledupAt: { $gt: param.pulledupAt }, // 주어진 pulledupAt 시기보다 더 나중에 끌올된 리서치
      },
    });
  }

  /** 인자로 받은 pulledupAt 보다 이전에 끌올된 리서치를 가져옵니다. */
  async getOlderResearches(param: { pulledupAt: string }) {
    return await this.getResearches({
      filterQuery: {
        hidden: false, // 숨겼거나
        blocked: false, // 차단되지 않은 리서치 중
        pulledupAt: { $lt: param.pulledupAt }, // 주어진 pulledupAt 시기보다 먼저 끌올된 리서치 중
      },
      limit: 20, // 최근 20개만
    });
  }

  /** 특정 유저가 업로드한 리서치를 20개 가져옵니다. */
  async getUploadedResearches(param: { userId: string }) {
    return await this.getResearches({
      filterQuery: { authorId: param.userId },
      limit: 20,
    });
  }

  /** 특정 유저가 업로드한 리서치 중 인자로 받은 pulledupAt 보다 먼저 끌올된 리서치를 20개 가져옵니다. */
  async getOlderUploadedResearches(param: {
    userId: string;
    pulledupAt: string;
  }) {
    return await this.getResearches({
      filterQuery: {
        authorId: param.userId,
        pulledupAt: { $lt: param.pulledupAt },
      },
      limit: 20,
    });
  }

  /**
   * (리서치 모듈이 시작될 때 사용됩니다)
   * 마감일이 존재하면서 아직 마감되지 않은 모든 리서치들의 _id 와 마감일 정보를 가져옵니다.
   * @author 현웅
   */
  async getAllOpenedResearchWithDeadline() {
    return await this.getResearches({
      filterQuery: {
        closed: false,
        deadline: { $ne: "" },
      },
      selectQuery: { deadline: true },
    });
  }
}
