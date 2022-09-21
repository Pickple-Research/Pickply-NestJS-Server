import { Controller, Inject, Request, Param, Get } from "@nestjs/common";
import { UserFindService } from "src/Service";
import { MongoUserFindService } from "src/Mongo";
import { FirebaseService } from "src/Firebase";
import { Public } from "src/Security/Metadata";
import { JwtUserInfo } from "src/Object/Type";

@Controller("users")
export class UserGetController {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;

  @Public()
  @Get("alarm")
  async getAlarm() {
    await this.firebaseService.sendPushAlarm({
      token:
        "dvRBn9fCRMGZKG4tjGzyEe:APA91bHHv3wTb_-IfETusHwe6W05O7vqLjfqZv5D0pv9W1nzuWT0l1r-eVITFmrd55hVEQKhDtrfAvP5roe1BajXYNav0C73erLgNASpghseBoYWY6b6v-wJQwZgUKx8kwdc1NGDFCgV",
      notification: {
        title: "test",
        body: "test",
      },
    });
  }

  /**
   * 요청한 유저의 최근 20개 크레딧 변동내역을 반환합니다.
   * @author 현웅
   */
  @Get("credit")
  async getCreditHistories(@Request() req: { user: JwtUserInfo }) {
    return await this.mongoUserFindService.getCreditHisories(req.user.userId);
  }

  /**
   * 요청한 유저의 크레딧 변동내역 중
   * 인자로 받은 크레딧 변동내역 _id 보다 더 나중에 생성된 크레딧 변동내역을 모두 가져옵니다.
   * @author 현웅
   */
  @Get("credit/newer/:creditHistoryId")
  async getNewerCreditHistories(
    @Request() req: { user: JwtUserInfo },
    @Param("creditHistoryId") creditHistoryId: string,
  ) {
    return await this.mongoUserFindService.getNewerCreditHisories({
      userId: req.user.userId,
      creditHistoryId,
    });
  }

  /**
   * 요청한 유저의 크레딧 변동내역 중
   * 인자로 받은 크레딧 변동내역 _id 보다 더 먼저 생성된 크레딧 변동내역을 20개 가져옵니다.
   * @author 현웅
   */
  @Get("credit/older/:creditHistoryId")
  async getOlderCreditHistories(
    @Request() req: { user: JwtUserInfo },
    @Param("creditHistoryId") creditHistoryId: string,
  ) {
    return await this.mongoUserFindService.getOlderCreditHisories({
      userId: req.user.userId,
      creditHistoryId,
    });
  }

  /**
   * 요청한 유저의 최근 20개 알림을 반환합니다.
   * @author 현웅
   */
  @Get("notifications")
  async getNotifications(@Request() req: { user: JwtUserInfo }) {
    return await this.mongoUserFindService.getNotifications(req.user.userId);
  }

  /**
   * 요청한 유저의 알림 중 인자로 받은 알림 _id 보다
   * 더 나중에 생성된 알림을 모두 가져옵니다.
   * @author 현웅
   */
  @Get("notifications/newer/:notificationId")
  async getNewerNotifications(
    @Request() req: { user: JwtUserInfo },
    @Param("notificationId") notificationId: string,
  ) {
    return await this.mongoUserFindService.getNewerNotifications({
      userId: req.user.userId,
      notificationId,
    });
  }

  /**
   * 요청한 유저의 알림 중 인자로 받은 알림 _id 보다
   * 더 먼저 생성된 알림을 20개 가져옵니다.
   * @author 현웅
   */
  @Get("notifications/older/:notificationId")
  async getOlderNotifications(
    @Request() req: { user: JwtUserInfo },
    @Param("notificationId") notificationId: string,
  ) {
    return await this.mongoUserFindService.getOlderNotifications({
      userId: req.user.userId,
      notificationId,
    });
  }

  /**
   * 인자로 받은 닉네임을 사용할 수 있는지 확인합니다.
   * 중복된 경우 false, 그렇지 않은 경우 true 를 반환합니다.
   * @author 현웅
   */
  @Public()
  @Get("nickname/:nickname/available")
  async checkNickname(@Param("nickname") nickname: string) {
    const user = await this.mongoUserFindService.getUserByNickname(nickname);
    if (user !== null) return false;
    return true;
  }
}
