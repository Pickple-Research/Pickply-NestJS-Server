import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 스크랩 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteScrap {
  @Prop({ required: true, index: true }) // 스크랩 대상 투표 _id
  voteId: string;

  @Prop({ required: true, index: true }) // 스크랩한 유저 _id
  userId: string;

  @Prop({ required: true }) // 스크랩 일시
  createdAt: string;
}

export const VoteScrapSchema = SchemaFactory.createForClass(VoteScrap);

export type VoteScrapDocument = VoteScrap & Document;
