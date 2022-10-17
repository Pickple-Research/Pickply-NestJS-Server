import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { FirebaseService } from "src/Firebase";
import {
  MongoUserFindService,
  MongoUserUpdateService,
  MongoResearchFindService,
} from "src/Mongo";
import { Roles } from "src/Security/Metadata";
import { AlarmType, UserType } from "src/Object/Enum";
import { JwtUserInfo, PushAlarm } from "src/Object/Type";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

/**
 * 관리자만 사용하는 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminPostController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject() private readonly mongoResearchFindService: MongoResearchFindService;

  @Roles(UserType.ADMIN)
  @Post("users/alarm")
  async sendPushAlarm() {
    const alarm: TokenMessage = {
      token: "",
      notification: {
        title: "",
        body: "",
      },
    };
    await this.firebaseService.sendPushAlarm(alarm);
  }

  /**
   * 여러 개의 푸시 알림을 전송합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Post("users/multiple/alarm")
  async sendMultiplePushAlarm(@Body() body: {}) {
    const participations =
      await this.mongoResearchFindService.getResearchParticipations({
        filterQuery: { researchId: "" },
        selectQuery: { userId: true },
      });
    const userIds = participations.map((participation) => participation.userId);
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
          title: "추가 크레딧 지급",
          body: "리서치 참여에 대한 누락 크레딧이 지급되었어요.",
        },
        data: {
          notificationId: "",
          type: AlarmType.WIN_EXTRA_CREDIT,
          detail: "",
          researchId: "",
        },
      });
    });

    await this.firebaseService.sendMultiplePushAlarm(pushAlarms);
  }
}
