import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { FirebaseService } from "src/Firebase";
import { MongoUserFindService, MongoUserUpdateService } from "src/Mongo";
import { Roles } from "src/Security/Metadata";
import { UserType } from "src/Object/Enum";
import { JwtUserInfo } from "src/Object/Type";

/**
 * 관리자만 사용하는 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin")
export class AdminPostController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  @Roles(UserType.ADMIN)
  @Post("")
  async blank() {}
}
