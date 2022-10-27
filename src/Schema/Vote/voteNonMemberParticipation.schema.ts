import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 비회원의 투표 참여 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteNonMemberParticipation {
  @Prop({ required: true, index: true }) // 참여 대상 투표 _id
  voteId: string;

  @Prop() // 참여한 유저 fcmToken (앱 버전 v1.1.9 이후 전달되는 정보이기 때문에 필수가 아닙니다)
  fcmToken?: string;

  @Prop({ required: true, type: [Number] }) // 선택한 선택지 index들
  selectedOptionIndexes: number[];

  @Prop({ required: true }) // 참여 일시
  createdAt: string;
}

export const VoteNonMemberParticipationSchema = SchemaFactory.createForClass(
  VoteNonMemberParticipation,
);

export type VoteNonMemberParticipationDocument = VoteNonMemberParticipation &
  Document;
