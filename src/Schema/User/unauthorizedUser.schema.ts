import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 이메일 인증이 완료되지 않은 유저 정보 스키마입니다.
 * 생성된지 일주일이 지나면 CronJob을 통해 자동 삭제됩니다.
 * @author 현웅
 */
@Schema()
export class UnauthorizedUser {
  @Prop() // 이메일
  email: string;

  @Prop({ default: false }) // 이메일 인증 여부
  authorized: boolean;

  @Prop() // 이메일 인증 시간 (인증되고 난 후 일정 시간 이내에 정규회원으로 가입을 마쳐야합니다)
  authorizedAt?: string;

  @Prop() // 인증 코드
  authorizationCode: string;

  @Prop() // 인증 코드 만료 시간
  codeExpiredAt: string;

  @Prop() // 회원가입 일자 (일주일 지나면 데이터 삭제)
  createdAt: string;
}

export const UnauthorizedUserSchema =
  SchemaFactory.createForClass(UnauthorizedUser);

export type UnauthorizedUserDocument = UnauthorizedUser & Document;
