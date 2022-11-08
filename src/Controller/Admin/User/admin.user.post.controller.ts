import { Controller, Inject, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";
import { FirebaseService } from "src/Firebase";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
} from "src/Mongo";
import { Roles } from "src/Security/Metadata";
import { AlarmType, UserType } from "src/Object/Enum";
import { PushAlarm } from "src/Object/Type";
import { MONGODB_USER_CONNECTION } from "src/Constant";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { CreditHistory } from "src/Schema";

/**
 * 관리자만 사용하는 유저 관련 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserPostController {
  constructor(
    private readonly firebaseService: FirebaseService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;

  /**
   * 특정 유저에게 푸시 알림을 전송합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("alarm")
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
  @Post("multiple/alarm")
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
   * 특정 유저에게 크레딧을 증정하거나 차감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("credit")
  async giveCredit(
    @Body()
    body: {
      userId: string;
      scale: number;
      reason: string;
      type: string;
    },
  ) {
    const creditBalance = await this.mongoUserFindService.getUserCreditBalance(
      body.userId,
    );
    const creditHistory: CreditHistory = {
      userId: body.userId,
      scale: body.scale,
      balance: creditBalance + body.scale,
      isIncome: body.scale >= 0 ? true : false,
      reason: body.reason, // "(관리자) 리서치 업로드 비용 지원"
      type: body.type, // "PRODUCT_EXCHANGE"
      createdAt: getCurrentISOTime(),
    };

    const userSession = await this.userConnection.startSession();
    await tryMultiTransaction(async () => {
      await this.mongoUserCreateService.createCreditHistory(
        { userId: body.userId, creditHistory },
        userSession,
      );
    }, [userSession]);
  }

  /**
   * 두 명 이상의 유저들에게 크레딧을 증정하거나 차감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("multiple/credit")
  async giveMultipleUserCredit(
    @Body()
    body: {
      userIds?: string[];
      researchId?: string;
      scale: number;
      reason: string;
      type: string;
    },
  ) {
    //* 유저를 직접 지정하는 경우
    let userIds: string[] = [];

    //* 특정 리서치 참여자들에게 주는 경우
    if (body.researchId) {
      const participations =
        await this.mongoResearchFindService.getResearchParticipations({
          filterQuery: { researchId: body.researchId },
          selectQuery: { userId: true },
        });
      userIds = participations.map((participation) => participation.userId);
    } else {
      userIds = body.userIds;
    }

    console.log(userIds.length);

    const currentISOTime = getCurrentISOTime();
    const users = await this.mongoUserFindService.getUsers({
      filterQuery: { _id: { $in: userIds } },
      selectQuery: { credit: true },
    });
    const creditHistories: CreditHistory[] = users.map((user) => ({
      userId: user._id,
      researchId: body.researchId,
      scale: body.scale,
      balance: user.credit + body.scale,
      isIncome: body.scale >= 0 ? true : false,
      reason: body.reason, // (교환한 상품명) / "리서치 참여에 대한 누락 크레딧 지급" / "(관리자) 리서치 업로드 크레딧 지원"
      type: body.type, // "PRODUCT_EXCHANGE" / "CREDIT_COMPENSATION" / "ETC"
      createdAt: currentISOTime,
    }));

    const userSession = await this.userConnection.startSession();
    await tryMultiTransaction(async () => {
      for (const creditHistory of creditHistories) {
        await this.mongoUserCreateService.createCreditHistory(
          { userId: creditHistory.userId, creditHistory },
          userSession,
        );
      }
    }, [userSession]);
  }
}
