import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerCreateService } from "src/Mongo";
import { PartnerPost, PartnerProduct } from "src/Schema";
import { PartnerCreateBodyDto } from "src/Dto";

@Injectable()
export class PartnerCreateService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerCreateService: MongoPartnerCreateService;
  /**
   * 새로운 파트너를 등록합니다.
   * @author 현웅
   */
  async uploadPartner(partnerCreateBodyDto: PartnerCreateBodyDto) {
    return await this.mongoPartnerCreateService.uploadPartner(
      partnerCreateBodyDto,
    );
  }

  /**
   * 새로운 게시글/이벤트를 등록합니다.
   * @author 현웅
   */
  async uploadPost(partnerPost: PartnerPost) {
    return await this.mongoPartnerCreateService.uploadPost(partnerPost);
  }

  /**
   * 새로운 제품/서비스를 등록합니다.
   * @author 현웅
   */
  async uploadProduct(partnerProduct: PartnerProduct) {
    return await this.mongoPartnerCreateService.uploadProduct(partnerProduct);
  }
}
