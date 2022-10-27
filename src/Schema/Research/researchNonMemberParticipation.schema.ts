import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 비회원의 리서치 참여 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchNonMemberParticipation {
  @Prop({ required: true, index: true }) // 참여 대상 리서치 _id
  researchId: string;

  @Prop({ required: true }) // 참여한 유저 fcmToken
  fcmToken: string;

  @Prop({ required: true }) // 리서치 참여에 걸린 시간
  consumedTime: number;

  @Prop({ required: true }) // 참여 일시
  createdAt: string;
}

export const ResearchNonMemberParticipationSchema =
  SchemaFactory.createForClass(ResearchNonMemberParticipation);

export type ResearchNonMemberParticipationDocument =
  ResearchNonMemberParticipation & Document;
