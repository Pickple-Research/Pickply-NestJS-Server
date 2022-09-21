import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientSession } from "mongoose";
import { GoogleService } from "src/Google";
import { MongoUserFindService, MongoUserUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { getSalt, getKeccak512Hash, didDatePassed } from "src/Util";
import {
  WrongPasswordException,
  WrongAuthorizationCodeException,
  AuthCodeExpiredException,
  EmailNotVerifiedException,
} from "src/Exception";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
  ) {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;

  /**
   * 주어진 이메일과 비밀번호를 사용해 로그인이 가능한지 확인합니다.
   * 해당 이메일을 사용하는 유저가 없는 경우,
   * 혹은 비밀번호가 다른 경우 오류를 일으킵니다.
   * @param email
   * @param password
   * @author 현웅
   */
  async authenticate(email: string, password: string) {
    //* UserSecurity 정보 조회
    const userSecurity = await this.mongoUserFindService.getUserSecurityByEmail(
      email,
    );

    //* 주어진 비밀번호 해쉬
    const hashedPassword = await this.getHashedPassword(
      password,
      userSecurity.salt,
    );

    //* 비밀번호가 일치하지 않는 경우
    if (hashedPassword !== userSecurity.password)
      throw new WrongPasswordException();
    return;
  }

  /**
   * 유저 기본 정보를 Jwt로 만들어 반환합니다.
   * @author 현웅
   */
  async issueJWT(userInfo: JwtUserInfo) {
    return this.jwtService.sign(userInfo, {
      secret: process.env.JWT_SECRET,
      expiresIn: "14d",
    });
  }

  /**
   * 로그인 시 fcm 토큰이 같이 전달되는 경우 유저 데이터에 저장합니다.
   * @author 현웅
   */
  async updateFcmToken(
    param:
      | { email: string; fcmToken?: string }
      | { userId: string; fcmToken?: string },
  ) {
    //* fcm 토큰이 없는 경우, 곧바로 반환
    if (!param.fcmToken) return;

    //* userId 대신 email 이 주어진 경우 (일반 로그인)
    if ("email" in param) {
      const user = await this.mongoUserFindService.getUser({
        userEmail: param.email,
        selectQuery: {},
      });
      await this.mongoUserUpdateService.updateUserNotificationSetting({
        userId: user._id.toString(),
        updateQuery: { $set: { fcmToken: param.fcmToken } },
      });
      return;
    }
    //* userId 가 주어진 경우 (자동 로그인)
    await this.mongoUserUpdateService.updateUserNotificationSetting({
      userId: param.userId,
      updateQuery: { $set: { fcmToken: param.fcmToken } },
    });
  }

  /**
   * 주어진 비밀번호와 salt 를 이용해 암호화된 비밀번호를 반환합니다.
   * @author 현웅
   */
  async getHashedPassword(password: string, salt: string) {
    return getKeccak512Hash(password + salt, parseInt(process.env.PEPPER));
  }

  /**
   * 기존 비밀번호를 검증하고 비밀번호를 재설정합니다.
   * @author 현웅
   */
  async changePassword(param: {
    userId: string;
    password: string;
    newPassword: string;
  }) {
    //* UserSecurity 정보 조회
    const userSecurity = await this.mongoUserFindService.getUserSecurityById(
      param.userId,
    );
    //* 주어진 비밀번호 해쉬
    const hashedPassword = await this.getHashedPassword(
      param.password,
      userSecurity.salt,
    );
    //* 기존 비밀번호가 일치하지 않는 경우
    if (hashedPassword !== userSecurity.password) {
      throw new WrongPasswordException();
    }
    //* 새 비밀번호 해쉬
    const newHashedPassword = await this.getHashedPassword(
      param.newPassword,
      userSecurity.salt,
    );
    //* 비밀번호 업데이트
    await this.mongoUserUpdateService.updateUserSecurity({
      userId: param.userId,
      updateQuery: { $set: { password: newHashedPassword } },
    });
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 비밀번호 재설정 인증번호를 전송하고
   * UserSecurity 의 authCode, codeExpiredAt 값과 verified 플래그를 업데이트 합니다.
   * @author 현웅
   */
  async sendPasswordResetAuthCode(
    param: { email: string; authCode: string; codeExpiredAt: string },
    session: ClientSession,
  ) {
    //* 유저 아이디 조회
    const userId = await this.mongoUserFindService.getUserIdByEmail(
      param.email,
    );

    //* 이메일 전송
    const sendAuthCode = this.googleService.sendAuthCodeEmail({
      to: param.email,
      code: param.authCode,
    });
    //* 인증번호 업데이트
    const updateAuthCode = this.mongoUserUpdateService.updateUserSecurity(
      {
        userId,
        updateQuery: {
          $set: {
            authCode: param.authCode,
            codeExpiredAt: param.codeExpiredAt,
          },
        },
      },
      session,
    );
    //* 위의 두 함수를 동시에 실행합니다. 이메일 전송에 실패하는 경우, 인증번호 업데이트는 취소됩니다.
    await Promise.all([sendAuthCode, updateAuthCode]);
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 비밀번호 재설정 인증번호를 인증합니다.
   * @author 현웅
   */
  async verifyPasswordResetAuthCode(param: { email: string; code: string }) {
    //* 인증번호, 인증번호 만료시간 조회
    const userSecurity = await this.mongoUserFindService.getUserSecurityByEmail(
      param.email,
    );
    //* 인증번호가 일치하지 않는 경우
    if (userSecurity.authCode !== param.code) {
      throw new WrongAuthorizationCodeException();
    }
    //* 인증번호 유효기간이 만료된 경우
    if (didDatePassed(userSecurity.codeExpiredAt)) {
      throw new AuthCodeExpiredException();
    }
    //* 인증번호가 일치하는 경우, verified 플래그를 true 로 업데이트
    await this.mongoUserUpdateService.updateUserSecurity({
      userId: userSecurity._id,
      updateQuery: { $set: { verified: true } },
    });
  }

  /**
   * 기존 비밀번호를 잊어버린 경우)
   * 이메일 인증 후 새 비밀번호를 재설정합니다.
   * 이메일 인증이 진행되지 않은 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async resetPassword(param: { email: string; newPassword: string }) {
    //* UserSecurity 정보 조회
    const userSecurity = await this.mongoUserFindService.getUserSecurityByEmail(
      param.email,
    );
    //* 이메일 인증이 진행되지 않은 경우
    if (!userSecurity.verified) {
      throw new EmailNotVerifiedException();
    }
    //* 새로운 비밀번호 해쉬
    const newHashedPassword = await this.getHashedPassword(
      param.newPassword,
      userSecurity.salt,
    );
    //* 비밀번호 업데이트 (* verified 플래그를 false 로 변경)
    await this.mongoUserUpdateService.updateUserSecurity({
      userId: userSecurity._id,
      updateQuery: { $set: { password: newHashedPassword, verified: false } },
    });
  }

  /**
   * 특정 유저의 비밀번호를 초기화합니다. Admin Patch Controller 에서 호출됩니다.
   * @author 현웅
   */
  async initializePassword(userId: string) {
    const userSecurity = await this.mongoUserFindService.getUserSecurityById(
      userId,
    );
    const initializedPassword = getSalt().slice(0, 8);
    const newHashedPassword = await this.getHashedPassword(
      initializedPassword,
      userSecurity.salt,
    );
    await this.mongoUserUpdateService.updateUserSecurity({
      userId,
      updateQuery: {
        $set: { password: newHashedPassword, initializedPassword },
      },
    });
  }
}
