import { Controller, Inject, Request, Body, Patch } from "@nestjs/common";
import { MongoUserUpdateService } from "src/Mongo";
import {
  UserBlockBodyDto,
  UpdateUserNotificationSettingBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { getCurrentISOTime } from "src/Util";

@Controller("users")
export class UserPatchController {
  constructor() {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 유저를 차단합니다. 자신이 차단한 유저의 리서치/투표 및 (대)댓글은 모두 가려집니다.
   * @author 현웅
   */
  @Patch("block")
  async blockUser(
    @Request() req: { user: JwtUserInfo },
    @Body() body: UserBlockBodyDto,
  ) {
    return await this.mongoUserUpdateService.blockUser({
      userId: req.user.userId,
      blockedUserId: body.blockedUserId,
    });
  }

  /**
   * 특정 알림을 읽음 처리합니다.
   * @author 현웅
   */
  @Patch("notifications/check")
  async checkNotification(@Body() body: { notificationId: string }) {
    await this.mongoUserUpdateService.updateNotification({
      notificationId: body.notificationId,
      updateQuery: { $set: { checked: true } },
    });
    return;
  }

  /**
   * 알림 설정을 변경하고 마지막 변경 시간을 업데이트합니다.
   * @author 현웅
   */
  @Patch("notifications/setting")
  async updateUserNotificationSetting(
    @Request() req: { user: JwtUserInfo },
    @Body() body: UpdateUserNotificationSettingBodyDto,
  ) {
    await this.mongoUserUpdateService.updateUserNotificationSetting({
      userId: req.user.userId,
      updateQuery: { $set: { ...body, lastUpdatedAt: getCurrentISOTime() } },
    });
    return;
  }
}
