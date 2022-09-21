import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  MongoUserCreateService,
  MongoUserDeleteService,
  MongoUserFindService,
  MongoUserUpdateService,
} from "src/Mongo";
import {
  CreditHistory,
  CreditHistorySchema,
  Notification,
  NotificationSchema,
  UnauthorizedUser,
  UnauthorizedUserSchema,
  User,
  UserSchema,
  UserNotice,
  UserNoticeSchema,
  UserNotificationSetting,
  UserNotificationSettingSchema,
  UserPrivacy,
  UserPrivacySchema,
  UserProperty,
  UserPropertySchema,
  UserRelation,
  UserRelationSchema,
  UserReport,
  UserReportSchema,
  UserSecurity,
  UserSecuritySchema,
} from "src/Schema";
import { MONGODB_USER_CONNECTION } from "src/Constant";

@Module({
  providers: [
    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
    MongoUserUpdateService,
  ],
  imports: [
    //? MongoUserModule에서 연결하고 사용할 DB와 Schema를 설정합니다.
    //?   이 부분을 정의할 때 비로소 DB에 Schema에 기반한 Collection이 생성됩니다.
    //? MongoUser[method]Service들을 Module로 묶지 않고 각각의 Service를 일일이 import 해서 사용하는 경우,
    //?   아래 코드를, 해당 서비스를 import한 모듈마다 새로 정의해야 하므로 번거로워지고 복잡해집니다.
    MongooseModule.forFeature(
      [
        { name: CreditHistory.name, schema: CreditHistorySchema },
        { name: Notification.name, schema: NotificationSchema },
        { name: UnauthorizedUser.name, schema: UnauthorizedUserSchema },
        { name: User.name, schema: UserSchema },
        { name: UserNotice.name, schema: UserNoticeSchema },
        {
          name: UserNotificationSetting.name,
          schema: UserNotificationSettingSchema,
        },
        { name: UserPrivacy.name, schema: UserPrivacySchema },
        { name: UserProperty.name, schema: UserPropertySchema },
        { name: UserRelation.name, schema: UserRelationSchema },
        { name: UserReport.name, schema: UserReportSchema },
        { name: UserSecurity.name, schema: UserSecuritySchema },
      ],
      MONGODB_USER_CONNECTION,
    ),
  ],
  //? 이 모듈을 import한 모듈이 사용하는 Service가 아래의 service들을 사용할 수 있도록 지정합니다.
  exports: [
    MongoUserCreateService,
    MongoUserDeleteService,
    MongoUserFindService,
    MongoUserUpdateService,
  ],
})
export class MongoUserModule {}
