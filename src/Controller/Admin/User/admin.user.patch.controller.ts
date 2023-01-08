import { Controller, Inject, Body, Patch, Param } from "@nestjs/common";
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
  constructor() { }

  @Inject()
  private readonly authService: AuthService;
  @Inject()
  private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * @author 승원
   * 
   * 특정 유저의 기본 정보와 특성 정보를 수정함
   * 날짜와 관련된 정보가 바로 바로 수정되서 
   * 클라이언트로 넘어오지 않음.
   * DB에서는 수정된 정보가 존재함.
   * 
   */

  @Roles(UserType.ADMIN)
  @Patch(":userId")
  async updateUser(
    @Param("userId") userId: string,
    @Body() body: {
      nickname?: string;
      email?: string;
      gender?: string;
      createdAt?: string;
      birthday?: string;
      credit?: number;
    }) {

    //return console.log(body)

    const editUser = await this.mongoUserUpdateService.updateUser({
      userId,
      updateQuery: {
        $set: {
          nickname: body.nickname,
          email: body.email,
          createdAt: body.createdAt,
          credit: body.credit
        }
      }
    })

    const editUserProperty = await this.mongoUserUpdateService.updateUserPropertyById({
      userId,
      updateQuery: {
        $set: {
          gender: body.gender,
          birthday: body.birthday

        }
      }
    })

    const user = await Promise.all([editUser, editUserProperty]).then(
      ([user, userProperty]) => {
        return {
          user,
          userProperty
        }
      },
    );

    //console.log(user)

    return user;

  }

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
