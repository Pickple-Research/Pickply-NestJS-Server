import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import {
  UserGetController,
  UserPostController,
  UserPatchController,
  UserDeleteController,
} from "src/Controller";
import { FirebaseModule } from "src/Firebase";
import { GoogleModule } from "src/Google";
import { SensService } from "src/NCP"; //승원 추가
import {
  AuthService,
  UserCreateService,
  UserFindService,
  UserDeleteService,
} from "src/Service";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
  MongoPartnerModule,
} from "src/Mongo";

/**
 * 유저 정보를 관리합니다. (회원가입, 정규유저 전환과 로그인 기능은 auth module이 담당합니다.)
 * @author 현웅
 */
@Module({
  controllers: [
    UserGetController,
    UserPostController,
    UserPatchController,
    UserDeleteController,
  ],
  providers: [
    SensService, //ncp sens
    AuthService,
    UserCreateService,
    UserFindService,
    UserDeleteService,
  ],
  imports: [
    FirebaseModule,
    GoogleModule,
    MongoUserModule,
    MongoResearchModule,
    MongoVoteModule,
    MongoPartnerModule,
    //* provider 로 포함시킨 AuthService 가 jwtService 를 사용하고 있으므로 JwtModule 을 imports 합니다.
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "14d" },
    }),
  ],
  exports: [UserCreateService],
})
export class UserModule {}
