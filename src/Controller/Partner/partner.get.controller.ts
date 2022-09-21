import { Controller, Inject, Get, Param } from "@nestjs/common";
import { MongoPartnerFindService } from "src/Mongo";
import { Public } from "src/Security/Metadata";

@Controller("partners")
export class PartnerGetController {
  constructor() {}

  @Inject() private readonly mongoPartnerFindService: MongoPartnerFindService;

  @Public()
  @Get("test")
  async testPartnerRouter() {
    return "test partner get controller";
  }

  @Public()
  @Get("")
  async getPartners() {
    return await this.mongoPartnerFindService.getPartners();
  }

  @Public()
  @Get(":partnerId")
  async getPartnerById(@Param() param: { partnerId: string }) {
    return await this.mongoPartnerFindService.getPartnerById(param.partnerId);
  }
}
