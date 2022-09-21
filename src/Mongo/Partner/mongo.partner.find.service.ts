import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Partner,
  PartnerDocument,
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
} from "src/Schema";

@Injectable()
export class MongoPartnerFindService {
  constructor(
    @InjectModel(Partner.name)
    private readonly Partner: Model<PartnerDocument>,
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
  ) {}

  /**
   * 최신 파트너 목록을 가져옵니다.
   * @author 현웅
   */
  async getPartners() {}

  //TODO: 파트너 기본 정보 이외에 리서치와 제품/게시글도 가져와야 합니다.
  /**
   * 파트너 _id로 파트너를 찾고 가져옵니다.
   * @author 현웅
   */
  async getPartnerById(partnerId: string) {
    return await this.Partner.findById({ partnerId }).lean();
  }
}
