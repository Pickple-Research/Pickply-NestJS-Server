import { Controller, Inject, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoVoteStandardizeService } from "src/Mongo";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 Patch 컨트롤러입니다.
 * 리서치 일괄마감, 리서치 및 투표 (대)댓글 블락 처리 등을 처리할 수 있습니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminGetController {
  constructor() {}

  @Inject()
  private readonly mongoVoteStandardizeService: MongoVoteStandardizeService;

  /**
   * 투표 관련 정보를 일괄적으로 변경합니다. 그 때마다 맞춰서 사용합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("votes/standardize")
  async standardizeVotesData() {
    await this.mongoVoteStandardizeService.standardize();
  }
}
