import { Controller, Inject, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import {
  MongoResearchFindService,
  MongoResearchStandardizeService,
} from "src/Mongo";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 리서치 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/researches")
export class AdminResearchGetController {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchStandardizeService: MongoResearchStandardizeService;

  /**
   * 원하는 리서치 관련 정보를 찾아냅니다. 그 때마다 맞춰서 사용합니다.
   * @author 현웅
   */
  @Get("find")
  async findResearchData() {
    const researches = await this.mongoResearchFindService.getResearches({
      filterQuery: {
        participantsNum: { $gte: 100 },
        _id: { $gt: "635fbd01a38b8f9ea3657183" },
      },
      selectQuery: { createdAt: true },
    });

    const datas = [];
    for (const researchInfo of researches) {
      const participations =
        await this.mongoResearchFindService.getResearchParticipations({
          filterQuery: { researchId: researchInfo._id.toString() },
          selectQuery: { createdAt: true },
          limit: 100,
        });
      const lastParticipation = participations[99];
      const hour = Math.floor(
        (new Date(lastParticipation.createdAt).getTime() -
          new Date(researchInfo.createdAt).getTime()) /
          1000 /
          60 /
          60,
      );

      datas.push({
        researchId: researchInfo._id.toString(),
        hour,
        createdAt: researchInfo.createdAt,
        achievedAt: lastParticipation.createdAt,
      });
    }
    console.log(datas);
    return datas;
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
