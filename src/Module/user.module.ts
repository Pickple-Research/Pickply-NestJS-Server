import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import {
  UserGetController,
  UserPostController,
  UserPatchController,
  UserDeleteController,
} from "src/Controller";
import { FirebaseService } from "src/Firebase";
import { GoogleService } from "src/Google";
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
  MongoSurBayModule,
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
    FirebaseService,
    GoogleService,
    AuthService,
    UserCreateService,
    UserFindService,
    UserDeleteService,
  ],
  imports: [
    MongoUserModule,
    MongoResearchModule,
    MongoVoteModule,
    MongoPartnerModule,
    MongoSurBayModule,
    //* provider 로 포함시킨 AuthService 가 jwtService 를 사용하고 있으므로 JwtModule 을 imports 합니다.
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "14d" },
    }),
  ],
})
export class UserModule {}
