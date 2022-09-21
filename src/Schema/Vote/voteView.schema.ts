import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 조회 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteView {
  @Prop({ required: true, index: true }) // 조회 대상 투표 _id
  voteId: string;

  @Prop({ required: true, index: true }) // 조회한 유저 _id
  userId: string;

  @Prop({ required: true }) // 조회 일시
  createdAt: string;
}

export const VoteViewSchema = SchemaFactory.createForClass(VoteView);

export type VoteViewDocument = VoteView & Document;
