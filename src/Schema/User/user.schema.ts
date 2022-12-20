import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserType, AccountType } from "src/Object/Enum";

/**
 * 유저 계정 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class User {
  @Prop({ enum: UserType, required: true }) // 유저 타입: 일반 유저, 테스터, 파트너, 관리자
  userType: UserType;

  @Prop({ enum: AccountType, required: true }) // 계정 회원가입 타입: 이메일, 카카오, 구글, 네이버
  accountType: AccountType;

  @Prop({ unique: true, sparse: true, trim: true }) // 이메일 (소셜 로그인을 이용하는 경우, 존재하지 않을 수도 있음)
  email?: string;

  @Prop({ unique: true, trim: true }) // 닉네임
  nickname: string;

  @Prop({ default: 0 }) // 크레딧
  credit?: number;

  @Prop({ default: 1 }) // 등급
  grade?: number;

  @Prop({ default: 0 }) // 신고된 횟수
  reportedNum?: number;

  @Prop({ default: 0 }) // 경고 받은 횟수
  warnedNum?: number;

  @Prop({ default: false }) // 계정 정지 여부
  blocked?: boolean;

  @Prop({ default: false }) // 탈퇴 요청 여부
  deleted?: boolean;

  @Prop() // 탈퇴 사유
  resignReason?: string;

  @Prop({ required: true }) // 회원가입 일자
  createdAt: string;

  @Prop() // 탈퇴 요청 일자
  deletedAt?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
