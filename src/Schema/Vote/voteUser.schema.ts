import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserType } from "src/Object/Enum";

/**
 * 투표 작성자, 투표 (대)댓글 작성자 정보를
 * populate를 통해 동적으로 가져오기 위해 사용되는 스키마입니다.
 * 유저가 생성될 때 _id 를 공유하며 같이 만들어지고, 수정 역시 일괄적으로 적용됩니다.
 * @author 현웅
 */
@Schema()
export class VoteUser {
  @Prop({ enum: UserType }) // 유저 타입: 일반 유저, 테스터, 파트너, 관리자
  userType: UserType;

  @Prop() // 유저 닉네임
  nickname: string;

  @Prop({ default: 1 }) // 등급
  grade: number;

  @Prop({ default: false }) // 유저 탈퇴 여부
  deleted?: boolean;
}

export const VoteUserSchema = SchemaFactory.createForClass(VoteUser);

export type VoteUserDocument = VoteUser & Document;
