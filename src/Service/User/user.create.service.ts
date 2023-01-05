import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { FirebaseService } from "src/Firebase";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoUserUpdateService,
  MongoUserDeleteService,
  MongoUserValidateService,
} from "src/Mongo";
import {
  CreditHistory,
  Notification,
  UnauthorizedUser,
  User,
  UserNotificationSetting,
  UserPrivacy,
  UserProperty,
  UserSecurity,
} from "src/Schema";
import { PushAlarm } from "src/Object/Type";
import { NotEnoughCreditException } from "src/Exception";

/**
 * 유저를 생성하는 서비스입니다.
 * @author 현웅
 */
@Injectable()
export class UserCreateService {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;
  @Inject() private readonly mongoUserValidateService: MongoUserValidateService;

  async createUnauthorizedUser(
    param: { userInfo: UnauthorizedUser },
    session: ClientSession,
  ) {
    //* 해당 이메일로 가입된 정규 유저가 있는지 확인합니다.
    const checkEmailDuplicated =
      this.mongoUserValidateService.checkEmailDuplicated(param.userInfo.email);
    //* 새로운 미인증 유저 데이터를 생성합니다.
    //* 이미 존재하는 경우, 데이터를 업데이트 합니다.
    const createUnauthorizedUser =
      this.mongoUserCreateService.createUnauthorizedUser(
        { userInfo: param.userInfo },
        session,
      );
    //* 위 두 함수를 동시에 실행합니다.
    //* 이메일 중복 검증에 실패하는 경우 미인증 유저에 관련된 작업은 모두 무효화됩니다.
    await Promise.all([checkEmailDuplicated, createUnauthorizedUser]);

    return;
  }

  /**
   * 이메일 인증이 완료된 미인증 유저 데이터를 기반으로 새로운 이메일 유저를 생성합니다.
   * @return 새로 생성된 유저 정보
   * @author 현웅
   */
  async createEmailUser(
    param: {
      user: User;
      userNotificationSetting: UserNotificationSetting;
      userPrivacy: UserPrivacy;
      userProperty: UserProperty;
      userSecurity: UserSecurity;
      skipEmailValidation?: boolean;
    },
    session: ClientSession,
  ) {
    //* 해당 이메일로 가입된 정규 유저가 있는지 확인합니다.
    const checkEmailDuplicated =
      this.mongoUserValidateService.checkEmailDuplicated(param.user.email);
    //* 해당 닉네임으로 가입된 정규 유저가 있는지 확인합니다.
    const checkNicknameDuplicated =
      this.mongoUserValidateService.checkNicknameDuplicated(
        param.user.nickname,
      );
    //* 이메일 인증이 완료되어 있는지 확인합니다.
    const checkEmailAuthorized =
      this.mongoUserValidateService.checkEmailAuthorized({
        email: param.user.email,
        skipValidation: param.skipEmailValidation,
      });
    //* 기존의 미인증 유저 데이터를 삭제합니다.
    const deleteUnauthorizedUser =
      this.mongoUserDeleteService.deleteUnauthorizedUser(
        { email: param.user.email },
        session,
      );
    //* 이메일 중복 확인, 닉네임 중복 확인, 인증 완료 확인, 기존 미인증 유저 삭제를 한꺼번에 진행합니다.
    await Promise.all([
      checkEmailDuplicated,
      checkNicknameDuplicated,
      checkEmailAuthorized,
      deleteUnauthorizedUser,
    ]);

    //* 이 후, 새로운 유저를 생성하고 생성된 유저 정보를 반환합니다.
    return await this.mongoUserCreateService.createEmailUser(
      {
        user: param.user,
        userNotificationSetting: param.userNotificationSetting,
        userPrivacy: param.userPrivacy,
        userProperty: param.userProperty,
        userSecurity: param.userSecurity,
      },
      session,
    );
  }

  /**
   * 사용자의 크레딧을 갱신하고 크레딧 사용내역을 만듭니다.
   * 이 때, 갱신된 사용자 크레딧이 음수가 되는 경우 에러를 발생시킵니다.
   * @author 현웅
   */
  async createCreditHistory(
    param: {
      userId: string;
      creditHistory: Omit<CreditHistory, "balance">;
    },
    session: ClientSession,
  ) {
    //* 사용자의 크레딧을 갱신합니다.
    const updatedUser = await this.mongoUserUpdateService.updateUser(
      {
        userId: param.userId,
        updateQuery: { $inc: { credit: param.creditHistory.scale } },
      },
      session,
    );

    //* 갱신된 사용자의 크레딧이 음수가 되는 경우 에러를 발생시킵니다.
    if (updatedUser.credit < 0) throw new NotEnoughCreditException();

    //* 그렇지 않은 경우, 크레딧 사용내역을 만듭니다.
    const creditHistory: CreditHistory = {
      ...param.creditHistory,
      balance: updatedUser.credit,
    };

    //* 크레딧 사용내역을 만들고 반환합니다.
    return await this.mongoUserCreateService.createCreditHistories(
      { creditHistories: [creditHistory] },
      session,
    );
  }

  /**
   * 유저 한명에게 개인화된 알림을 생성하고 푸시알림을 보냅니다. Session 은 사용하지 않습니다.
   *
   * @param force 조건을 무시하고 알림을 전송할지 여부
   *
   * @author 현웅
   */
  async makeNotification(param: {
    notification: Notification;
    force?: boolean;
  }) {
    const force = param.force ? param.force : false;

    //* 알림 생성
    const newNotification =
      await this.mongoUserCreateService.createNotification({
        notification: param.notification,
      });

    //* 푸시알림 전송 준비
    const user = await this.mongoUserFindService.getUserNotificationSettingById(
      {
        userId: param.notification.userId,
        selectQuery: { fcmToken: true, appPush: true },
      },
    );

    //* 전송 대상 유저가 없거나, fcmToken 이 없는 경우 (로그아웃) 전송하지 않습니다.
    if (!user || !Boolean(user.fcmToken)) return;

    //* 푸시알림 수신 동의를 하지 않은 경우 역시 전송하지 않지만, force 옵션이 true 인 경우 조건에 관계 없이 전송합니다.
    if (!user.appPush && !force) return;

    //* 푸시알림에 들어가는 데이터는 string 형태여야 하므로, undefined 값이 생기지 않도록 빈 값을 넣어줍니다.
    //* (나중에 일부 data 에는 JSON.stringify 를 해주어야 할 수도 있습니다)
    const researchId = param.notification.researchId
      ? param.notification.researchId
      : "";
    const voteId = param.notification.voteId ? param.notification.voteId : "";

    const pushAlarm: PushAlarm = {
      token: user.fcmToken,
      notification: {
        title: param.notification.title,
        body: param.notification.content,
      },
      data: {
        notificationId: newNotification._id.toString(),
        type: param.notification.type,
        detail: param.notification.detail,
        researchId,
        voteId,
      },
    };
    await this.firebaseService.sendPushAlarm(pushAlarm);
  }
}
