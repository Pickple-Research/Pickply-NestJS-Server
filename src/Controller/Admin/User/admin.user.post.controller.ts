import { Controller, Inject, Body, Post, Get } from "@nestjs/common";
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
import { Notification, CreditHistory } from "src/Schema";

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
   * 여러 개의 푸시 알림을 전송합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("alarm")
  async sendMultiplePushAlarm(
    @Body()
    body: {
      userIds?: string[];
      researchId?: string;
      fcmTokens?: string[];
      title?: string;
      body?: string;
      imageUrl?: string;
    },
  ) {
    if (body.fcmTokens) {
      const pushAlarms: PushAlarm[] = [];

      body.fcmTokens.forEach((token) => {
        pushAlarms.push({
          token,
          notification: {
            title: body.title,
            body: body.body,
            imageUrl: body.imageUrl,
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
      return;
    }

    let userIds: string[] = body.userIds;
    // let userIds: string[] = [];

    // if (body.userIds) {
    //   userIds = body.userIds;
    // } else if (body.researchId) {
    //   const participations =
    //     await this.mongoResearchFindService.getResearchParticipations({
    //       filterQuery: { researchId: body.researchId },
    //       selectQuery: { userId: true },
    //     });
    //   userIds = participations.map((participation) => participation.userId);
    // }

    console.log(userIds.length);

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
          // "추가 크레딧 지급" / "리서치 참여에 대한 크레딧이 정상 지급되었습니다."
          title: body.title,
          // "리서치 참여에 대한 누락 크레딧이 지급되었어요." / "불편함을 끼쳐드려 죄송합니다. 기다려주셔서 감사합니다."
          body: body.body,
          imageUrl: body.imageUrl,
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

    // const currentISOTime = getCurrentISOTime();
    // const notifications: Notification[] = [];
    // userIds.forEach((userId) => {
    //   notifications.push({
    //     userId,
    //     type: "ETC",
    //     title: body.title,
    //     content: body.body,
    //     detail: "EXPO 이벤트 당첨",
    //     createdAt: currentISOTime,
    //     researchId: body.researchId,
    //   });
    // });

    // for (const notification of notifications) {
    //   await this.mongoUserCreateService.createNotification({ notification });
    // }
  }

  /**
   * 다수 유저에게 크레딧을 증정하거나 차감합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("credit")
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
      reason: body.reason, // (교환한 상품명) / "리서치 참여에 대한 누락 크레딧 지급" / "회원간 크레딧 이관" / "(관리자) 리서치 업로드 크레딧 지원"
      type: body.type, // "PRODUCT_EXCHANGE" / "CREDIT_COMPENSATION" / "CREDIT_SHARE" / "ETC"
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

  /**
   * ((2022.11.11 발송) 리서치를 진행했던 유저들에게 리뷰 요청 알림을 발송합니다.)
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("multiple/alarm/review")
  async sendAlarmForReview() {
    const researches = await this.mongoResearchFindService.getResearches({
      filterQuery: { closed: true },
      selectQuery: {
        authorId: true,
        participantsNum: true,
        nonMemberParticipantsNum: true,
      },
    });

    const preTreatResearches = researches.map((research) => ({
      researchId: research._id,
      userId: research.authorId,
      participantsNum:
        research.participantsNum + research.nonMemberParticipantsNum,
    }));
    console.log(preTreatResearches.length);

    const trimmedResearches = preTreatResearches
      .sort((a, b) => b.participantsNum - a.participantsNum)
      .filter(
        (research) =>
          research.participantsNum >= 30 && research.participantsNum < 75,
      )
      .filter(
        (research, index, self) =>
          self.findIndex((res) => res.userId === research.userId) === index,
      );
    console.log(trimmedResearches.length);

    const currentISOTime = getCurrentISOTime();

    for (const research of trimmedResearches) {
      const notificationSetting =
        await this.mongoUserFindService.getUserNotificationSettingById({
          userId: research.userId,
        });
      const title = `최근 리서치에서 ${research.participantsNum}명의 참여자를 모으셨네요!`;
      const body = `픽플리가 도움이 되셨다면 앱 리뷰를 남겨주실래요?`;

      const notification: Notification = {
        userId: research.userId,
        type: "ETC",
        title,
        content: body,
        researchId: research.researchId,
        createdAt: currentISOTime,
      };
      const newNotification =
        await this.mongoUserCreateService.createNotification({ notification });

      const pushAlarm: PushAlarm = {
        token: notificationSetting.fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          type: "ETC",
          notificationId: newNotification._id.toString(),
          researchId: research.researchId.toString(),
        },
      };

      try {
        await this.firebaseService.sendPushAlarm(pushAlarm);
      } catch (e) {
        console.log(
          `ERROR: researchId: ${research.researchId}, userId: ${research.userId}`,
        );
      }
    }
  }
}
