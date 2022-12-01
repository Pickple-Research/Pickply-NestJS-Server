import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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

/**
 * 유저 관련 데이터를 원하는 방식으로 뽑아냅니다.
 * @author 현웅
 */
@Injectable()
export class MongoUserStatService {
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

  async getStat() {
    return await this.getGenderRatio();
  }

  /**
   * 2022년 11월 22일 이전 회원가입자들의 성비를 계산합니다.
   * @author 현웅
   */
  async getGenderRatio() {
    const userProperties = await this.UserProperty.find({
      _id: { $lt: "637b7d9c6c7405eee42af8d5" },
    })
      .select({ gender: true })
      .lean();
    const userGenders = userProperties.map(
      (userProperty) => userProperty.gender,
    );
    console.log(userGenders.filter((gender) => gender === "MALE").length);
    console.log(userGenders.filter((gender) => gender === "FEMALE").length);
  }
}
