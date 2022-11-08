import { Controller, Inject, Body, Patch } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoUserUpdateService } from "src/Mongo";
import { AuthService } from "src/Service";
import { UserType } from "src/Object/Enum";

/**
 * 관리자만 사용하는 유저 관련 Patch 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserPatchController {
  constructor() {}

  @Inject()
  private readonly authService: AuthService;
  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 다수 유저의 정보를 일괄적으로 변경합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("multiple/credit/update")
  async updateMultipleUser() {
    const userIds = [];

    await this.mongoUserUpdateService.updateMultipleUsers({
      filterQuery: { _id: { $in: userIds } },
      updateQuery: { $inc: { credit: -9 } },
    });
  }

  /**
   * 특정 유저의 비밀번호를 초기화합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Patch("password/initialize")
  async initializeUserPassword(@Body() body: { userId: string }) {
    await this.authService.initializePassword(body.userId);
  }
}
