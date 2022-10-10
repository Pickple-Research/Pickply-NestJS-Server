import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import {
  CreditHistory,
  CreditHistoryDocument,
  Notification,
  NotificationDocument,
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
  UserNotice,
  UserNoticeDocument,
  UserNotificationSetting,
  UserNotificationSettingDocument,
  UserPrivacy,
  UserPrivacyDocument,
  UserProperty,
  UserPropertyDocument,
  UserRelation,
  UserRelationDocument,
  UserSecurity,
  UserSecurityDocument,
} from "src/Schema";
import { getCurrentISOTime } from "src/Util";

@Injectable()
export class MongoUserDeleteService {
  constructor(
    @InjectModel(CreditHistory.name)
    private readonly CreditHistory: Model<CreditHistoryDocument>,
    @InjectModel(Notification.name)
    private readonly Notification: Model<NotificationDocument>,
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
    @InjectModel(UserNotice.name)
    private readonly UserNotice: Model<UserNoticeDocument>,
    @InjectModel(UserNotificationSetting.name)
    private readonly UserNotification: Model<UserNotificationSettingDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserRelation.name)
    private readonly UserRelation: Model<UserRelationDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
  ) {}

  /**
   * 특정 유저의 모든 알림을 삭제합니다.
   * (Session 은 사용하지 않습니다)
   * @author 현웅
   */
  async deleteAllNotification(userId: string) {
    await this.Notification.deleteMany({ userId });
  }

  /**
   * 특정 알림을 삭제합니다.
   * @author 현웅
   */
  async deleteNotification(notificationId: string) {
    await this.Notification.findByIdAndDelete(notificationId);
  }

  /**
   * 이메일 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  async deleteUnauthorizedUser(
    param: { email: string },
    session: ClientSession,
  ) {
    await this.UnauthorizedUser.findOneAndDelete(
      { email: param.email },
      { session },
    );
  }

  /**
   * 인자로 받은 미인증 유저 _id 리스트에 포함된
   * 미인증 유저 데이터를 삭제합니다.
   * @author 현웅
   */
  async deleteUnauthorizedUsersById(userIds: string[]) {
    await this.UnauthorizedUser.deleteMany({ _id: { $in: userIds } });
  }

  /**
   * 사용자 탈퇴 요청시, 곧바로 사용자 정보를 지우지 않고 deleted 플래그를 true 로 변경합니다.
   * @author 현웅
   */
  async preDeleteUser(param: { userId: string }) {
    await this.User.findByIdAndUpdate(param.userId, {
      $set: { deleted: true, deletedAt: getCurrentISOTime() },
    });
  }

  /**
   * 인자로 받은 _id를 사용하는 유저의 모든 데이터를 삭제합니다.
   * UserNotice, UserNotification, UserPrivacy, UserRelation, UserSecurity 및
   * 해당 유저의 크레딧 변동내역과 알림을 모두 삭제하되,
   * UserProperty는 데이터 분석을 위해 남겨둡니다.
   * @author 현웅
   */
  async deleteUserById(param: { userId: string }, session: ClientSession) {
    await this.User.findByIdAndDelete(param.userId, { session });
    await this.UserNotice.findByIdAndDelete(param.userId, { session });
    await this.UserNotification.findByIdAndDelete(param.userId, { session });
    await this.UserPrivacy.findByIdAndDelete(param.userId, { session });
    await this.UserRelation.findByIdAndDelete(param.userId, { session });
    await this.UserSecurity.findByIdAndDelete(param.userId, { session });
    await this.CreditHistory.deleteMany({ userId: param.userId }, { session });
    await this.Notification.deleteMany({ userId: param.userId }, { session });
  }
}
