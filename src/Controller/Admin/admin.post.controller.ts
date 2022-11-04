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
 * 관리자만 사용하는 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminPostController {
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
   * 특정 유저에게 푸시 알림을 전송합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("users/alarm")
  async sendPushAlarm(
    @Body()
    body: {
      token: string;
      title: string;
      body: string;
      data: Record<string, string>;
    },
  ) {
    const alarm: TokenMessage = {
      token: body.token,
      notification: {
        title: body.title,
        body: body.body,
      },
      data: body.data,
    };
    await this.firebaseService.sendPushAlarm(alarm);
  }

  /**
   * 여러 개의 푸시 알림을 전송합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("users/multiple/alarm")
  async sendMultiplePushAlarm(
    @Body()
    body: {
      userIds?: string[];
      researchId?: string;
      title?: string;
      body?: string;
    },
  ) {
    let userIds: string[] = [];

    if (body.userIds) {
      userIds = body.userIds;
    } else if (body.researchId) {
      const participations =
        await this.mongoResearchFindService.getResearchParticipations({
          filterQuery: { researchId: body.researchId },
          selectQuery: { userId: true },
        });
      userIds = participations.map((participation) => participation.userId);
    }

    console.log(userIds);

    const notificationSettings =
      await this.mongoUserFindService.getUserNotificationSettings({
        filterQuery: { _id: { $in: userIds } },
        selectQuery: { fcmToken: true },
      });

    const pushAlarms: PushAlarm[] = [];
    notificationSettings.forEach((notificationSetting) => {
      pushAlarms.push({
        token: notificationSetting.fcmToken,
        notification: {
          title: body.title, // "추가 크레딧 지급"
          body: body.body, // "리서치 참여에 대한 누락 크레딧이 지급되었어요."
        },
        data: {
          notificationId: "",
          type: AlarmType.WIN_EXTRA_CREDIT,
          detail: "",
          researchId: body.researchId,
        },
      });
    });

    await this.firebaseService.sendMultiplePushAlarm(pushAlarms);
  }

  /**
   * (리서치 참여 버그가 생겨 반영이 되지 않은 경우 사용)
   * 리서치 참여 정보와 크레딧 사용내역을 생성합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("researches/participations")
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
