import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 참여 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteParticipation {
  @Prop({ required: true, index: true }) // 참여 대상 투표 _id
  voteId: string;

  @Prop({ required: true, index: true }) // 참여한 유저 _id
  userId: string;

  @Prop({ required: true, type: [Number] }) // 선택한 선택지 index들
  selectedOptionIndexes: number[];

  @Prop({ required: true }) // 참여 일시
  createdAt: string;
}

export const VoteParticipationSchema =
  SchemaFactory.createForClass(VoteParticipation);

export type VoteParticipationDocument = VoteParticipation & Document;
