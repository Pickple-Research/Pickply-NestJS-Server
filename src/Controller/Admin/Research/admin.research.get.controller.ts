import { Controller, Inject, Get, Param } from "@nestjs/common";
import { Public, Roles } from "src/Security/Metadata";
import { MongoResearchStandardizeService, MongoResearchFindService } from "src/Mongo";
import { UserType } from "src/Object/Enum";
import { encrypt } from "src/Util/crypto.util";

/**
 * 관리자만 사용하는 리서치 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/researches")
export class AdminResearchGetController {
  constructor() { }

  @Inject()
  private readonly mongoResearchStandardizeService: MongoResearchStandardizeService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;

  /**
   * 
   * @author 승원
   * 설문 조사를 모두 가져옵니다.
   * 
   */
  //@Public() // 추후 삭제
  @Roles(UserType.ADMIN)
  @Get("")
  async getResearches() {
    const researches = await this.mongoResearchFindService.getResearches({});
    return encrypt(researches);
  }

  // @Public() // 추후 삭제
  @Roles(UserType.ADMIN)
  @Get(":researchId")
  async getResearchInfo(@Param("researchId") researchId: string) {
    const getResearch = await this.mongoResearchFindService.getResearchById({ researchId });
    return encrypt(getResearch);
  }

  //@Public() // 추후 삭제
  @Roles(UserType.ADMIN)
  @Get(":researchId/comments")
  async getResearchComments(@Param("researchId") researchId: string) {
    const getResearchComments = await this.mongoResearchFindService.getResearchComments(researchId);
    return encrypt(getResearchComments);
  }



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
