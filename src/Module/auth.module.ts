import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/Controller";
import { AuthService, UserFindService } from "src/Service";
import { GoogleModule } from "src/Google";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
} from "src/Mongo";

/**
 * 로그인, 정규유저 전환 기능을 담당합니다.
 * @author 현웅
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, UserFindService],
  imports: [
    GoogleModule,
    MongoUserModule,
    MongoResearchModule,
    MongoVoteModule,
    //? authService 에서 jwtService를 사용하고 있으므로 imports에 포함시킵니다
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "14d" },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
