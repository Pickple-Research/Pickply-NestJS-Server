import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Research, ResearchDocument } from "src/Schema";

/**
 * 리서치 데이터를 일괄적으로 변경할 때 사용하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class MongoResearchStandardizeService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
  ) {}

  async standardize() {
    return "standardize research data";
    // await this.
  }

  /**
   * v1.1.13) 리서치 비회원 참여자 수 추가
   * @author 현웅
   */
  async addNonMemberParticipantsNum() {
    await this.Research.find({ nonMemberParticipantsNum: null }).then(
      (researches) => {
        console.log(researches.length);
        researches.forEach((research) => {
          research.nonMemberParticipantsNum = 0;
          research.save();
        });
      },
    );
  }
}
