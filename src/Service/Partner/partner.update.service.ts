import { Injectable, Inject } from "@nestjs/common";
import { MongoPartnerUpdateService } from "src/Mongo";

@Injectable()
export class PartnerUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  async updatePost() {
    return await this.mongoPartnerUpdateService.updatePost();
  }

  async updateProduct() {
    return await this.mongoPartnerUpdateService.updateProduct();
  }
}
