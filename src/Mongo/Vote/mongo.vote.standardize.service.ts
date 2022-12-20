import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  UserProperty,
  UserPropertyDocument,
  Vote,
  VoteDocument,
  VoteParticipation,
  VoteParticipationDocument,
} from "src/Schema";
import { getAgeGroup } from "src/Util";

/**
 * 투표 관련 정보를 일괄적으로 변경할 때 사용하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class MongoVoteStandardizeService {
  constructor(
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(Vote.name) private readonly Vote: Model<VoteDocument>,
    @InjectModel(VoteParticipation.name)
    private readonly VoteParticipation: Model<VoteParticipationDocument>,
  ) {}

  async standardize() {
    // await this.();
  }

  async closeVotesBeforeNovember2022() {
    await this.Vote.updateMany(
      { _id: { $lte: "635fa0120fc4ccb784451386" } },
      { $set: { closed: true } },
    );
  }

  /**
   * v1.1.12) 투표 통계 분석 결과 추가
   * @author 현웅
   */
  async addVoteAnalyticsData() {
    await this.VoteParticipation.find()
      .select({
        voteId: true,
        selectedOptionIndexes: true,
        gender: true,
        ageGroup: true,
      })
      .then((participations) => {
        participations.forEach((participation) => {
          const incQuery = {};
          participation.selectedOptionIndexes.forEach((optionIndex) => {
            incQuery[
              `analytics.${optionIndex}.${participation.gender}.${participation.ageGroup}`
            ] = 1;
          });
          this.Vote.findByIdAndUpdate(participation.voteId, {
            $inc: incQuery,
          }).exec();
        });
      });
  }

  /**
   * v1.1.11) 투표 참여 정보에 사용자 특성 추가
   * @author 현웅
   */
  async addPropertyToVoteParticipation() {
    await this.UserProperty.find()
      .select({ gender: true, birthday: true })
      .then((properties) => {
        properties.forEach((property) => {
          const ageGroup = getAgeGroup(property.birthday);
          this.VoteParticipation.updateMany(
            { userId: property._id.toString() },
            {
              $set: { gender: property.gender, ageGroup },
            },
          ).exec();
        });
      });
  }

  /**
   * v1.1.11) 투표 통계 분석 결과 추가
   * @author 현웅
   */
  async addAnalytics() {
    await this.Vote.find()
      .select({ options: true })
      .then((votes) => {
        votes.forEach((vote) => {
          vote.analytics = new Array(vote.options.length).fill({
            MALE: {},
            FEMALE: {},
          });
          vote.save();
        });
      });
  }
}
