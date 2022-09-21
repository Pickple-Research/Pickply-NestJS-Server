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
import {
  EmailDuplicateException,
  NicknameDuplicateException,
  UserNotFoundException,
  EmailNotAuthorizedException,
} from "src/Exception";

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

  /**
   * _id, 혹은 email 인자를 받아 해당 조건에 맞는 User 정보를 찾고 반환합니다.
   * selectQuery 를 이용하여 원하는 속성만 골라 반환할 수도 있습니다.
   * 조건에 맞는 User 정보가 없는 경우 null 을 반환합니다.
   * @author 현웅
   */
  async getUser(
    param:
      | { userId: string; selectQuery?: Partial<Record<keyof User, boolean>> }
      | {
          userEmail: string;
          selectQuery?: Partial<Record<keyof User, boolean>>;
        },
  ) {
    if ("userId" in param) {
      const user = await this.User.findById(
        param.userId,
        param.selectQuery,
      ).lean();
      if (user) return user;
      return null;
    }

    const user = await this.User.findOne(
      { email: param.userEmail },
      param.selectQuery,
    ).lean();
    if (user) return user;
    return null;
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저들의 정보를 반환합니다.
   * selectQuery 를 통해 원하는 속성만 골라 반환할 수도 있습니다.
   * @author 현웅
   */
  async getUsersById(param: {
    userIds: string[];
    selectQuery?: Partial<Record<keyof User, boolean>>;
  }) {
    return await this.User.find(
      { _id: { $in: param.userIds } },
      param.selectQuery,
    ).lean();
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
   * 주어진 이메일을 사용하는 유저의 _id 를 반환합니다
   * @author 현웅
   */
  async getUserIdByEmail(email: string) {
    const user = await this.User.findOne({ email }).select({ _id: 1 }).lean();
    if (!user) throw new UserNotFoundException();
    return user._id;
  }

  /**
   * 인자로 받은 이메일로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkEmailDuplicated(email: string) {
    const user = await this.User.findOne({ email }).lean();
    if (user) throw new EmailDuplicateException();
    return;
  }

  /**
   * 인자로 받은 닉네임으로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkNicknameDuplicated(nickname: string) {
    const user = await this.User.findOne({ nickname })
      .select({ _id: 1 })
      .lean();
    if (user) throw new NicknameDuplicateException();
    return;
  }

  /**
   * 정규유저를 만들기 전, 인자로 주어진 이메일이 인증된 상태인지 확인합니다.
   * 인증되어 있지 않은 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async checkEmailAuthorized(param: {
    email: string;
    skipValidation?: boolean;
  }) {
    if (param.skipValidation === true) return;

    const user = await this.UnauthorizedUser.findOne({ email: param.email })
      .select({ authorized: 1 })
      .lean();
    if (!user || !user.authorized) throw new EmailNotAuthorizedException();
    return;
  }

  /**
   * 주이진 userId 를 사용하는 유저 데이터를 반환합니다.
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
   * 주이진 userId 를 사용하는 유저 데이터를 반환합니다.
   * (UserPrivacy 와 UserSecurity 는 제외하고 반환)
   * @author 현웅
   */
  async getUserInfoByEmail(email: string) {
    const user = await this.User.findOne({ email }).select({ _id: 1 }).lean();

    if (!user || user.deleted === true) throw new UserNotFoundException();
    if (user) return await this.getUserInfoById(user._id);
  }

  /**
   * 인자로 받은 닉네임을 사용하는 유저를 찾고 반환합니다.
   * 존재하지 않는다면 null을 반환합니다.
   * @author 현웅
   */
  async getUserByNickname(nickname: string) {
    const user = await this.User.findOne({
      nickname,
    })
      .select({ _id: 1 })
      .lean();

    if (user) return user;
    return null;
  }

  /**
   * @deprecated {@link getUserNotificationSettings} 로 대체 가능
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
   * 유저 알림 설정 정보를 가져옵니다.
   * @author 현웅
   */
  async getUserNotificationSettings(param: {
    userId?: string;
    filterQuery?: FilterQuery<UserNotificationSettingDocument>;
    selectQuery?: Partial<Record<keyof UserNotificationSetting, boolean>>;
  }) {
    // if(param.userId){
    //   return await this.UserNotificationSetting.findById(param.userId)
    //     .select(param.selectQuery)
    //     .lean();
    // }
    return await this.UserNotificationSetting.find(param.filterQuery)
      .select(param.selectQuery)
      .lean();
  }

  /**
   * 인자로 받은 _id 를 사용하는 유저의 비밀번호와 salt 를 반환합니다.
   * @author 현웅
   */
  async getUserSecurityById(userId: string) {
    return await this.UserSecurity.findById(userId)
      .select({
        password: 1,
        salt: 1,
      })
      .lean();
  }

  /**
   * 이메일을 인자로 받아 해당 이메일을 사용하는 유저의 _id, 비밀번호와 salt 를 반환합니다.
   * @author 현웅
   */
  async getUserSecurityByEmail(email: string) {
    const user = await this.User.findOne({
      email,
    })
      .select({ _id: 1 })
      .lean();

    if (!user) throw new UserNotFoundException();

    return await this.UserSecurity.findById(user._id.toString()).lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 잔여 크레딧을 가져옵니다.
   * 해당 유저의 가장 마지막 크레딧 변동 내역의 잔액을 기준으로 산출합니다.
   * @author 현웅
   */
  async getCreditBalance(userId: string) {
    const latestCreditHistories = await this.CreditHistory.find({ userId })
      .select({ balance: true })
      .sort({ _id: -1 })
      .limit(1)
      .lean();
    if (!latestCreditHistories || latestCreditHistories.length === 0) return 0;
    return latestCreditHistories[0].balance;
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 최근 20개 크레딧 변동내역을 가져옵니다.
   * @author 현웅
   */
  async getCreditHisories(userId: string) {
    return await this.CreditHistory.find({ userId })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
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
    return await this.CreditHistory.find({
      _id: { $gt: param.creditHistoryId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .lean();
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
    return await this.CreditHistory.find({
      _id: { $lt: param.creditHistoryId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
  }

  /**
   * 인자로 받은 userId 를 사용하는 유저의 최근 20개 알림을 가져옵니다.
   * @author 현웅
   */
  async getNotifications(userId: string) {
    return await this.Notification.find({ userId })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
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
    return await this.Notification.find({
      _id: { $gt: param.notificationId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .lean();
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
    return await this.Notification.find({
      _id: { $lt: param.notificationId },
      userId: param.userId,
    })
      .sort({ _id: -1 })
      .limit(20)
      .lean();
  }
}
