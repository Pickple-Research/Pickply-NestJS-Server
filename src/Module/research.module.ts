import { Module, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import {
  ResearchDeleteController,
  ResearchGetController,
  ResearchPatchController,
  ResearchPostController,
} from "src/Controller";
import {
  UserCreateService,
  UserUpdateService,
  ResearchDeleteService,
  ResearchFindService,
  ResearchCreateService,
  ResearchUpdateService,
} from "src/Service";
import { FirebaseService } from "src/Firebase";
import { AwsS3Service } from "src/AWS";
import { MongoUserModule, MongoResearchModule } from "src/Mongo";
import { RESEARCH_AUTO_CLOSE_CRONJOB_NAME } from "src/Constant";

@Module({
  controllers: [
    ResearchGetController,
    ResearchPatchController,
    ResearchPostController,
    ResearchDeleteController,
  ],
  providers: [
    FirebaseService,
    AwsS3Service,
    UserCreateService,
    UserUpdateService,
    ResearchDeleteService,
    ResearchCreateService,
    ResearchFindService,
    ResearchUpdateService,
  ],
  imports: [MongoUserModule, MongoResearchModule],
  exports: [ResearchUpdateService],
})
export class ResearchModule implements OnModuleInit {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,

    private readonly researchFindService: ResearchFindService,
    private readonly researchUpdateService: ResearchUpdateService,
  ) {}

  /**
   * 리서치 모듈이 만들어지면
   * 마감되지 않은 리서치를 모두 가져와 이미 마감일이 지난 리서치는 마감하고,
   * 아직 마감일이 지나지 않은 리서치에 대해서는 CronJob 을 만들어 ScheduleRegistry 에 등록합니다.
   *
   * ! 이 때, ScheduleRegistry 에 CronJob 을 등록할 때 에러가 나면 서버가 터지므로 반드시 try catch 를 사용합니다.
   * (ex. Job 이름이 겹치는 경우, Job 을 삭제할 때 해당 이름의 Job 이 없는 경우 등)
   * @author 현웅
   */
  async onModuleInit() {
    //TODO: 서버에서 같은 Container 를 두 개 돌리고 있기 때문에, 해당 부분이 처리되기 전까지는 일단 구동되지 않게 합니다.
    return;

    //* 만약 NODE_ENV 값이 프로덕션이 아니라면 리서치 자동 마감 기능을 활성화하지 않습니다.
    if (process.env.NODE_ENV !== "PROD") return;

    //* 마감일이 존재하면서 아직 마감되지 않은 모든 리서치 정보를 가져옵니다.
    const openedResearches =
      await this.researchFindService.getAllOpenedResearchWithDeadline();

    for (const research of openedResearches) {
      if (!Boolean(research.deadline)) continue;

      //* 이미 마감일이 지난 경우, CronJob 을 등록하지 않고 리서치를 마감합니다.
      if (new Date(research.deadline) < new Date()) {
        await this.researchUpdateService.closeResearch({
          userId: "",
          researchId: research._id,
          skipValidation: true,
        });
        continue;
      }

      this.researchUpdateService.addResearchAutoCloseCronJob({
        researchId: research._id,
        deadline: research.deadline,
      });
    }

    return;
  }
}
