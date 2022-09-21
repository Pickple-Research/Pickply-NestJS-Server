import { Body, Controller, Post } from "@nestjs/common";
import { PartnerCreateService } from "src/Service";
import {
  PartnerCreateBodyDto,
  PartnerPostCreateBodyDto,
  PartnerProductCreateBodyDto,
} from "src/Dto";
import { getCurrentISOTime } from "src/Util";

@Controller("partners")
export class PartnerPostController {
  constructor(private readonly partnerCreateService: PartnerCreateService) {}

  @Post("")
  async uploadPartner(@Body() body: PartnerCreateBodyDto) {
    return await this.partnerCreateService.uploadPartner(body);
  }

  @Post("post")
  async uploadPost(@Body() body: PartnerPostCreateBodyDto) {
    return await this.partnerCreateService.uploadPost({
      ...body,
      createdAt: getCurrentISOTime(),
    });
  }

  @Post("product")
  async uploadProduct(@Body() body: PartnerProductCreateBodyDto) {
    return await this.partnerCreateService.uploadProduct({
      ...body,
    });
  }
}
