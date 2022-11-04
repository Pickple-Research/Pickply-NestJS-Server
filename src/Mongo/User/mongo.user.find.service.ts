import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
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
import { UserNotFoundException } from "src/Exception";

@Injectable()
export class MongoUserFindService {
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
    private readonly UserNotificationSetting: Model<UserNotificationSettingDocument>,
    @InjectModel(UserPrivacy.name)
    private readonly UserPrivacy: Model<UserPrivacyDocument>,
    @InjectModel(UserProperty.name)
    private readonly UserProperty: Model<UserPropertyDocument>,
    @InjectModel(UserRelation.name)
    private readonly UserRelation: Model<UserRelationDocument>,
    @InjectModel(UserSecurity.name)
    private readonly UserSecurity: Model<UserSecurityDocument>,
  ) {}

  // ********************************** //
  /** 기본형 **/
  // ********************************** //

  /**
   * 유저 숫자를 받아옵니다
   * @author 승원
   */

  async getUsersNumber() {
    return await this.User.count();
  }

  /**
   * 유저 _id 를 통해 유저 정보를 받아옵니다.
   * @author 현웅
   */
  async getUserById(param: {
    userId: string;
    selectQuery?: Partial<Record<keyof User, boolean>>;
    handleAsException?: boolean;
  }) {
    const user = await this.User.findById(param.userId)
      .select(param.selectQuery)
      .lean();
    if (!user && param.handleAsException === true) {
      throw new UserNotFoundException();
    }
    return user;
  }

  /**
   * 유저 이메일을 통해 유저 정보를 받아옵니다.
   * @author 현웅
   */
  async getUserByEmail(param: {
    email: string;
    selectQuery?: Partial<Record<keyof User, boolean>>;
    handleAsException?: boolean;
  }) {
    const user = await this.User.findOne({ email: param.email })
      .select(param.selectQuery)
      .lean();
    if (!user && param.handleAsException === true) {
      throw new UserNotFoundException();
    }
    return user;
  }

  /**
   * 유저를 원하는 조건으로 검색합니다.
   * MongoUserFindService 외부에서 사용하는 것을 지양합니다.
   * @author 현웅
   */
  async getUsers(param: {
    filterQuery?: FilterQuery<UserDocument>;
    selectQuery?: Partial<Record<keyof User, boolean>>;
  }) {
    return await this.User.find(param.filterQuery)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 크레딧 변동 내역을 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getCreditHistories(param: {
    filterQuery?: FilterQuery<CreditHistoryDocument>;
    selectQuery?: Partial<Record<keyof CreditHistory, boolean>>;
    limit?: number;
  }) {
    return await this.CreditHistory.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  /**
   * 특정 유저의 알림 설정 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserNotificationSettingById(param: {
    userId: string;
    selectQuery?: Partial<Record<keyof UserNotificationSetting, boolean>>;
  }) {
    return await this.UserNotificationSetting.findById(param.userId)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 유저 알림 설정 정보를 원하는 조건으로 가져옵니다.
   * @author 현웅
   */
  async getUserNotificationSettings(param: {
    filterQuery?: FilterQuery<UserNotificationSettingDocument>;
    selectQuery?: Partial<Record<keyof UserNotificationSetting, boolean>>;
  }) {
    return await this.UserNotificationSetting.find(param.filterQuery)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 특정 유저의 특성 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserPropertyById(param: {
    userId: string;
    selectQuery?: Partial<Record<keyof UserProperty, boolean>>;
  }) {
    return await this.UserProperty.findById(param.userId)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 유저 특성 정보를 원하는 조건으로 가져옵니다.
   * @author 현웅
   */
  async getUserProperties(param: {
    filterQuery?: FilterQuery<UserPropertyDocument>;
    selectQuery?: Partial<Record<keyof UserProperty, boolean>>;
  }) {
    return await this.UserProperty.find(param.filterQuery)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 특정 유저의 보안 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserSecurityById(param: {
    userId: string;
    selectQuery?: Partial<Record<keyof UserSecurity, boolean>>;
  }) {
    return await this.UserSecurity.findById(param.userId)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 이메일을 통해 특정 유저의 보안 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserSecurityByEmail(param: {
    email: string;
    selectQuery?: Partial<Record<keyof UserSecurity, boolean>>;
  }) {
    const userId = await this.getUserIdByEmail(param.email);
    return await this.getUserSecurityById({
      userId,
      selectQuery: param.selectQuery,
    });
  }

  /**
   * 유저 알림을 원하는 조건으로 검색합니다.
   * @author 현웅
   */
  async getNotifications(param: {
    filterQuery?: FilterQuery<NotificationDocument>;
    selectQuery?: Partial<Record<keyof Notification, boolean>>;
    limit?: number;
  }) {
    return await this.Notification.find(param.filterQuery)
      .select(param.selectQuery)
      .sort({ _id: -1 })
      .limit(param.limit)
      .lean();
  }

  // ********************************** //
  /** 활용형 **/
  // ********************************** //

  /**
   * 주어진 이메일을 사용하는 유저의 _id 를 반환합니다
   * @author 현웅
   */
  async getUserIdByEmail(email: string) {
    const user = await this.getUserByEmail({
      email,
      selectQuery: { email: true },
    });
    if (!user) throw new UserNotFoundException();
    return user._id.toString();
  }

  /**
   * 주이진 userId 를 사용하는 유저의 모든 데이터를 반환합니다.
   * (UserPrivacy와 UserSecurity는 제외하고 반환)
   * @author 현웅
   */
  async getUserInfoById(userId: string) {
    const getUser = this.User.findById(userId).lean();
    const getUserNotice = this.UserNotice.findById(userId).lean();
    const getUserNotificationSetting =
      this.UserNotificationSetting.findById(userId).lean();
    const getUserProperty = this.UserProperty.findById(userId).lean();
    const getUserRelation = this.UserRelation.findById(userId).lean();

    return await Promise.all([
      getUser,
      getUserNotice,
      getUserNotificationSetting,
      getUserProperty,
      getUserRelation,
    ]).then(
      //* [user, userNotice, ...] 형태였던 반환값을 {user, userNotice, ...} 형태로 바꿔줍니다.
      ([
        user,
        userNotice,
        userNotificationSetting,
        userProperty,
        userRelation,
      ]) => {
        if (!user || user.deleted === true) throw new UserNotFoundException();

        return {
          user,
          userNotice,
          userNotificationSetting,
          userProperty,
          userRelation,
        };
      },
    );
  }

  /**
   * 주이진 userId 를 사용하는 유저의 모든 데이터를 반환합니다.
   * (UserPrivacy 와 UserSecurity 는 제외하고 반환)
   * @author 현웅
   */
  async getUserInfoByEmail(email: string) {
    return await this.getUserInfoById(await this.getUserIdByEmail(email));
  }

  /**
   * 인자로 받은 닉네임을 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @author 현웅
   */
  async getUserByNickname(nickname: string) {
    const users = await this.getUsers({
      filterQuery: { nickname },
      selectQuery: { nickname: true },
    });
    if (users.length === 0) return null;
    return users;
  }

  /**
   * 이메일이 인증되지 않은 모든 미인증 유저들의 정보를 반환합니다.
   * @author 현웅
   */
  async getAllUnauthorizedUser(param: {
    selectQuery?: Partial<Record<keyof UnauthorizedUser, boolean>>;
  }) {
    return await this.UnauthorizedUser.find({ authorized: false })
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 잔여 크레딧을 가져옵니다.
   * @author 현웅
   */
  async getUserCreditBalance(userId: string) {
    const user = await this.getUserById({
      userId,
      selectQuery: { credit: true },
    });
    return user.credit;
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 최근 20개 크레딧 변동내역을 가져옵니다.
   * @author 현웅
   */
  async getRecentCreditHistories(userId: string) {
    return await this.getCreditHistories({
      filterQuery: { userId },
      limit: 20,
    });
  }

  /**
   * 인자로 받은 userId 의 크레딧 변동내역 중
   * 인자로 받은 creditHistoryId 보다 최신의 크레딧 변동내역을 모두 가져옵니다.
   * @author 현웅
   */
  async getNewerCreditHisories(param: {
    userId: string;
    creditHistoryId: string;
  }) {
    return await this.getCreditHistories({
      filterQuery: {
        userId: param.userId,
        _id: { $gt: param.creditHistoryId },
      },
    });
  }

  /**
   * 인자로 받은 userId 의 크레딧 변동내역 중
   * 인자로 받은 creditHistoryId 보다 오래된 크레딧 변동내역을 20개 가져옵니다.
   * @author 현웅
   */
  async getOlderCreditHisories(param: {
    userId: string;
    creditHistoryId: string;
  }) {
    return await this.getCreditHistories({
      filterQuery: {
        userId: param.userId,
        _id: { $lt: param.creditHistoryId },
      },
    });
  }

  /**
   * 인자로 받은 유저의 최근 알림 20개를 가져옵니다.
   * @author 현웅
   */
  async getRecentNotifications(userId: string) {
    return await this.getNotifications({
      filterQuery: { userId },
      limit: 20,
    });
  }

  /**
   * 인자로 받은 userId 의 알림 중
   * 인자로 받은 notificationId 보다 최신의 알림을 모두 가져옵니다.
   * @author 현웅
   */
  async getNewerNotifications(param: {
    userId: string;
    notificationId: string;
  }) {
    return await this.getNotifications({
      filterQuery: { $gt: param.notificationId, userId: param.userId },
    });
  }

  /**
   * 인자로 받은 userId 의 알림 중
   * 인자로 받은 notificationId 보다 오래된 알림을 20개 가져옵니다.
   * @author 현웅
   */
  async getOlderNotifications(param: {
    userId: string;
    notificationId: string;
  }) {
    return await this.getNotifications({
      filterQuery: { $lt: param.notificationId, userId: param.userId },
    });
  }
}
