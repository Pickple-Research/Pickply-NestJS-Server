import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

/**
 * 이메일을 사용한 최초 회원가입 요청시 (즉, 미인증 유저 생성시)
 * Body에 포함되어야 하는 정보들입니다.
 * @param email
 * @author 현웅
 */
export class EmailUnauthorizedUserSignupBodyDto {
  @IsString()
  email: string;
}

/**
 * 유저 신고 시 Body 에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class UserReportBodyDto {
  @IsString()
  targetUserId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * 유저 차단 요청 시 Body 에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class UserBlockBodyDto {
  @IsString()
  blockedUserId: string;
}

/**
 * 인증 완료된 이메일을 사용하여 실제 회원가입 요청시
 * Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class EmailUserSignupBodyDto {
  /** 이메일 */
  @IsString()
  email: string;

  /** 성 */
  @IsString()
  lastName: string;

  /** 이름 */
  @IsString()
  name: string;

  /** 비밀번호 */
  @IsString()
  password: string;

  /** 닉네임 */
  @IsString()
  nickname: string;

  /** 생년 */
  @IsNumber()
  birthYear: number;

  /** 생월 */
  @IsNumber()
  birthMonth: number;

  /** 생일 */
  @IsNumber()
  birthDay: number;

  /** 성별 */
  @IsString()
  gender: string;

  /** 서비스 정보 수신 동의 여부 */
  @IsBoolean()
  agreeReceiveServiceInfo: boolean;

  /** 이벤트를 통해 유입된 경우 포함되는 정보들 */
  @IsString()
  @IsOptional()
  signupEvent?: string;

  @IsNumber()
  @IsOptional()
  signupEventCredit?: number;
}
