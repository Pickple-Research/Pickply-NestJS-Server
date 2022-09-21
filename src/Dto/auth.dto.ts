import { IsString, IsOptional } from "class-validator";

/**
 * 로그인 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param email
 * @param password
 * @param fcmToken (optional)
 * @author 현웅
 */
export class LoginBodyDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;
}

/**
 * Jwt 를 이용한 자동 로그인 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param fcmToken (optional)
 * @author 현웅
 */
export class JwtLoginBodyDto {
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

/**
 * 이메일 미인증 유저 인증 요청시/기존 유저 비밀번호 재설정 코드 인증 요청시
 * Body에 포함되어야 하는 정보들입니다.
 * @param email
 * @param code 인증번호
 * @author 현웅
 */
export class AuthCodeVerificationBodyDto {
  @IsString()
  email: string;

  @IsString()
  code: string;
}

/**
 * 비밀번호를 재설정할 때 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class ChangePasswordBodyDto {
  @IsString()
  password: string;

  @IsString()
  newPassword: string;
}

/**
 * 이메일로 인증번호를 요청할 때 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class SendPasswordResetAuthCodeBodyDto {
  @IsString()
  email: string;
}

/**
 * 기존 비밀번호를 잊어버려 이메일을 인증한 후 다시 설정할 때
 * Body 에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class ResetPasswordBodyDto {
  @IsString()
  email: string;

  @IsString()
  newPassword: string;
}
