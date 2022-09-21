import { Injectable } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection } from "mongoose";
import {
  Partner,
  PartnerDocument,
  PartnerActivity,
  PartnerActivityDocument,
  PartnerPost,
  PartnerPostDocument,
  PartnerProduct,
  PartnerProductDocument,
} from "src/Schema";
import { MONGODB_PARTNER_CONNECTION } from "src/Constant";
import { tryTransaction } from "src/Util";
import { PartnerCreateBodyDto } from "src/Dto";

@Injectable()
export class MongoPartnerCreateService {
  constructor(
    @InjectModel(Partner.name)
    private readonly Partner: Model<PartnerDocument>,
    @InjectModel(PartnerActivity.name)
    private readonly PartnerActivity: Model<PartnerActivityDocument>,
    @InjectModel(PartnerPost.name)
    private readonly PartnerPost: Model<PartnerPostDocument>,
    @InjectModel(PartnerProduct.name)
    private readonly PartnerProduct: Model<PartnerProductDocument>,

    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly connection: Connection,
  ) {}

  /**
   * @Transaction
   * 새로운 파트너를 등록합니다.
   * @author 현웅
   */
  async uploadPartner(partnerCreateBodyDto: PartnerCreateBodyDto) {
    const session = await this.connection.startSession();
    return await tryTransaction(async () => {
      //* 먼저 파트너 데이터를 만듭니다.
      const newPartner = await this.Partner.create([partnerCreateBodyDto], {
        session,
      });
      //* 이후 PartnerActivity를 만들고 _id를 동기화합니다.
      const newPartnerId = newPartner[0]._id;
      await this.PartnerActivity.create([{ _id: newPartnerId }]);
      return;
    }, session);
  }

  /**
   * @Transaction
   * 새로운 게시글/이벤트를 등록합니다.
   * @author 현웅
   */
  async uploadPost(partnerPost: PartnerPost) {
    const session = await this.connection.startSession();
    return await tryTransaction(async () => {
      const newPost = await this.PartnerPost.create([partnerPost], {
        session,
      });
      const newPostId = newPost[0]._id;

      //* 새로운 게시글 _id를 파트너의 postIds 맨 앞에 추가합니다.
      await this.PartnerActivity.findByIdAndUpdate(partnerPost.partnerId, {
        $push: { postIds: { $each: [newPostId], $position: 0 } },
      });
      return;
    }, session);
  }

  /**
   * @Transaction
   * 새로운 제품/서비스를 등록합니다.
   * @author 현웅
   */
  async uploadProduct(partnerProduct: PartnerProduct) {
    const session = await this.connection.startSession();
    return await tryTransaction(async () => {
      const newProduct = await this.PartnerProduct.create([partnerProduct], {
        session,
      });
      const newProductId = newProduct[0]._id;

      //* 새로운 제품 _id를 파트너의 productIds 맨 앞에 추가합니다.
      await this.PartnerActivity.findByIdAndUpdate(partnerProduct.partnerId, {
        $push: { productIds: { $each: [newProductId], $position: 0 } },
      });
      return;
    }, session);
  }
}
