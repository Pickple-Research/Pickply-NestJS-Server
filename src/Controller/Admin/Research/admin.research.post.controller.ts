import { Controller, Inject, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";
import { FirebaseService } from "src/Firebase";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
  MongoResearchCreateService,
} from "src/Mongo";
import { Roles } from "src/Security/Metadata";
import { AlarmType, CreditHistoryType, UserType } from "src/Object/Enum";
import { PushAlarm } from "src/Object/Type";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
} from "src/Constant";
import { getCurrentISOTime, getAgeGroup, tryMultiTransaction } from "src/Util";
import { CreditHistory, ResearchParticipation } from "src/Schema";

/**
 * 관리자만 사용하는 리서치 관련 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/researches")
export class AdminResearchPostController {
  constructor(
    private readonly firebaseService: FirebaseService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;

  /**
   * (리서치 참여 버그가 생겨 반영이 되지 않은 경우 사용)
   * 리서치 참여 정보와 크레딧 사용내역을 생성합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("participations")
  async makeResearchParticipations(
    @Body() body: { userIds: string[]; researchId: string },
  ) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    const currentISOTime = getCurrentISOTime();

    const users = await this.mongoUserFindService.getUsers({
      filterQuery: { _id: { $in: body.userIds } },
      selectQuery: { credit: true },
    });
    const userProperties = await this.mongoUserFindService.getUserProperties({
      filterQuery: { _id: { $in: body.userIds } },
      selectQuery: { gender: true, birthday: true },
    });
    const research = await this.mongoResearchFindService.getResearchById({
      researchId: body.researchId,
      selectQuery: { title: true, credit: true },
    });

    const creditHistories: CreditHistory[] = users.map((user) => ({
      userId: user._id,
      researchId: research._id,
      type: CreditHistoryType.RESEARCH_PARTICIPATE,
      reason: research.title,
      scale: research.credit,
      balance: user.credit + research.credit,
      isIncome: true,
      createdAt: currentISOTime,
    }));
    const researchParticipations: ResearchParticipation[] = userProperties.map(
      (userProperty) => ({
        userId: userProperty._id,
        researchId: body.researchId,
        consumedTime: 0,
        createdAt: currentISOTime,
        gender: userProperty.gender,
        ageGroup: getAgeGroup(userProperty.birthday),
      }),
    );

    await tryMultiTransaction(async () => {
      for (const creditHistory of creditHistories) {
        await this.mongoUserCreateService.createCreditHistory(
          {
            userId: creditHistory.userId,
            creditHistory,
          },
          userSession,
        );
      }

      for (const researchParticipation of researchParticipations) {
        await this.mongoResearchCreateService.createResearchParticipation(
          {
            researchParticipation,
          },
          researchSession,
        );
      }
    }, [userSession, researchSession]);

    //? 이렇게 하면 transaction 에러가 납니다. 왜??
    // await tryMultiTransaction(async () => {
    //   console.log("start transaction");
    //   await this.mongoUserCreateService.createCreditHistories(
    //     { creditHistories },
    //     userSession,
    //   );
    //   console.log("creditHistories created");
    //   await this.mongoResearchCreateService.createResearchParticipations(
    //     { researchParticipations },
    //     researchSession,
    //   );
    //   console.log("researchParticipations created");
    //   return;
    // }, [userSession, researchSession]);

    return;
  }
}
