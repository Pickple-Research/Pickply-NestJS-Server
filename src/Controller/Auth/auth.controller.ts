import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AuthService, UserFindService } from "src/Service";
import {
  MongoUserFindService,
  MongoUserUpdateService,
  MongoSurBayService,
} from "src/Mongo";
import { Public } from "src/Security/Metadata";
import {
  LoginBodyDto,
  JwtLoginBodyDto,
  AuthCodeVerificationBodyDto,
  ChangePasswordBodyDto,
  SendPasswordResetAuthCodeBodyDto,
  ResetPasswordBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction, getISOTimeAfterGivenMinutes } from "src/Util";
import { MONGODB_USER_CONNECTION } from "src/Constant";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userFindService: UserFindService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject() private readonly mongoSurBayService: MongoSurBayService;

  /**
   * 이메일, 비밀번호를 받아 로그인합니다.
   * 이메일과 비밀번호가 일치하지 않는다면 에러를 일으키고,
   * 일치한다면 JWT를 발급합니다.
   * @return JWT와 유저 정보
   * @author 현웅
   */
  @Public()
  @Post("login")
  async loginWithEmail(@Body() body: LoginBodyDto) {
    //* User, UserNotice, userProperty, UserRelation 정보 반환
    const getUserInfo = this.mongoUserFindService.getUserInfoByEmail(
      body.email,
    );
    //* 이메일과 비밀번호가 유효한지 확인
    const authenticate = this.authService.authenticate(
      body.email,
      body.password,
    );
    //* 위 두 함수를 동시에 실행
    const userInfo = await Promise.all([getUserInfo, authenticate]).then(
      ([userInfo, _]) => {
        return userInfo;
      },
    );

    //* 인자로 Fcm 토큰이 주어진 경우 업데이트
    const updateFcmToken = this.authService.updateFcmToken({
      email: body.email,
      fcmToken: body.fcmToken,
    });
    //* 유저의 모든 활동 데이터 반환
    const getUserActivities = await this.userFindService.getUserActivities({
      userId: userInfo.user._id,
    });
    //* JWT 새로 발급
    const issueJwt = await this.authService.issueJWT({
      userType: userInfo.user.userType,
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    });

    //* 위 세 함수를 동시에 실행
    const { userActivities, jwt } = await Promise.all([
      updateFcmToken,
      getUserActivities,
      issueJwt,
    ]).then(([_, userActivities, jwt]) => {
      return { userActivities, jwt };
    });

    //* 가져온 정보를 모두 반환
    return { jwt, userInfo, userActivities };
  }

  /**
   * 기존에 발급했던 JWT로 로그인합니다.
   * TODO: JWT가 만료되었을 경우 커스텀 메세지 / 혹은 refreshToken 필요
   * @return 새로운 JWT와 유저 정보
   * @author 현웅
   */
  @Post("login/jwt")
  async loginWithJwt(
    @Request() req: { user: JwtUserInfo },
    @Body() body: JwtLoginBodyDto,
  ) {
    //* User, UserNotice, userProperty, UserRelation 정보 반환
    const userInfo = await this.mongoUserFindService.getUserInfoById(
      req.user.userId,
    );

    //* Fcm 토큰 업데이트
    const updateFcmToken = this.authService.updateFcmToken({
      userId: req.user.userId,
      fcmToken: body.fcmToken,
    });
    //* 유저의 모든 활동 데이터 반환
    const getUserActivities = this.userFindService.getUserActivities({
      userId: userInfo.user._id,
    });
    //* JWT 새로 발급
    const issueJwt = this.authService.issueJWT({
      userType: userInfo.user.userType,
      userId: userInfo.user._id,
      userNickname: userInfo.user.nickname,
      userEmail: userInfo.user.email,
    });
    //* 위 세 함수 동시에 실행
    const { userActivities, jwt } = await Promise.all([
      updateFcmToken,
      getUserActivities,
      issueJwt,
    ]).then(([_, userActivities, jwt]) => {
      return { userActivities, jwt };
    });

    return { jwt, userInfo, userActivities };
  }

  /**
   * SurBay DB 데이터를 통해 로그인합니다.
   * @author 현웅
   */
  @Public()
  @Post("login/surbay")
  async surBayLogin(@Body() body: LoginBodyDto) {
    return await this.mongoSurBayService.surBayLogin({
      email: body.email,
      password: body.password,
    });
  }

  /**
   * 로그아웃합니다. fcm 토큰을 초기화합니다.
   * @author 현웅
   */
  @Post("logout")
  async logout(@Request() req: { user: JwtUserInfo }) {
    return await this.mongoUserUpdateService.updateUserNotificationSetting({
      userId: req.user.userId,
      updateQuery: { $set: { fcmToken: "" } },
    });
  }

  /**
   * 이메일 미인증 유저의 인증 코드를 검증합니다.
   * @author 현웅
   */
  @Public()
  @Post("verify")
  async verifyEmailUser(@Body() body: AuthCodeVerificationBodyDto) {
    //* 입력한 인증 번호가 다르거나
    //* 해당 이메일을 사용하는 유저가 존재하지 않으면 에러를 일으킵니다.
    return await this.mongoUserUpdateService.verifyUnauthorizedUserCode({
      email: body.email,
      code: body.code,
    });
  }

  /**
   * 기존 비밀번호를 이용해 비밀번호를 재설정합니다.
   * @author 현웅
   */
  @Post("password/change")
  async changePassword(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ChangePasswordBodyDto,
  ) {
    return await this.authService.changePassword({
      userId: req.user.userId,
      password: body.password,
      newPassword: body.newPassword,
    });
  }

  /**
   * 기존 비밀번호를 잊어버린 경우) 이메일로 인증번호를 전송합니다.
   * @author 현웅
   */
  @Public()
  @Post("password/code")
  async sendPasswordResetAuthCode(
    @Body() body: SendPasswordResetAuthCodeBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();

    const authCode = (
      "00000" + Math.floor(Math.random() * 1_000_000).toString()
    ).slice(-6);

    return await tryMultiTransaction(async () => {
      await this.authService.sendPasswordResetAuthCode(
        {
          email: body.email,
          authCode,
          codeExpiredAt: getISOTimeAfterGivenMinutes(60),
        },
        userSession,
      );
    }, [userSession]);
  }

  /**
   * 기존 비밀번호를 잊어버린 경우) 전송된 인증번호를 검증합니다.
   * @author 현웅
   */
  @Public()
  @Post("password/code/verify")
  async verifyPasswordResetAuthCode(@Body() body: AuthCodeVerificationBodyDto) {
    return await this.authService.verifyPasswordResetAuthCode({
      email: body.email,
      code: body.code,
    });
  }

  /**
   * 기존 비밀번호를 잊어버린 경우, 이메일 인증을 진행한 후 비밀번호를 재설정합니다.
   * @author 현웅
   */
  @Public()
  @Post("password/reset")
  async resetPassword(@Body() body: ResetPasswordBodyDto) {
    return await this.authService.resetPassword({
      email: body.email,
      newPassword: body.newPassword,
    });
  }
}
