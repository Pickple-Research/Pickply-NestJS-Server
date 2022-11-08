import { Controller, Inject, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoResearchStandardizeService } from "src/Mongo";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 리서치 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/researches")
export class AdminResearchGetController {
  constructor() {}

  @Inject()
  private readonly mongoResearchStandardizeService: MongoResearchStandardizeService;

  /**
   * 리서치 관련 정보를 일괄적으로 변경합니다. 그 때마다 맞춰서 사용합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("standardize")
  async standardizeResearchesData() {
    await this.mongoResearchStandardizeService.standardize();
  }
}
