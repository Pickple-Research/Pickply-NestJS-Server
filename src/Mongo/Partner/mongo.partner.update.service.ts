import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
  PartnerActivity,
  PartnerActivityDocument,
} from "src/Schema";

@Injectable()
export class MongoPartnerUpdateService {
  constructor(
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
    @InjectModel(PartnerProduct.name)
    private readonly PartnerProduct: Model<PartnerProductDocument>,
    @InjectModel(PartnerActivity.name)
    private readonly PartnerActivity: Model<PartnerActivityDocument>,
  ) {}

  async updateProduct() {}

  async updatePost() {}

  /**
   * @Transaction
   * 파트너를 팔로우합니다.
   * @author 현웅
   */
  async updateFollower(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    await this.PartnerActivity.findByIdAndUpdate(
      param.partnerId,
      { $addToSet: { followerIds: { $each: [param.userId], $position: 0 } } },
      { session },
    );
    return;
  }

  /**
   * @Transaction
   * 파트너 팔로우를 취소합니다.
   * @author 현웅
   */
  async updateUnfollower(
    param: { userId: string; partnerId: string },
    session?: ClientSession,
  ) {
    await this.PartnerActivity.findByIdAndUpdate(
      param.partnerId,
      { $pull: { followerIds: param.userId } },
      { session },
    );
    return;
  }
}
