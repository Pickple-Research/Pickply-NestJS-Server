import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 결과 통계 조회권 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteStatTicket {
  @Prop({ required: true, index: true }) // 투표 _id
  voteId: string;

  @Prop({ required: true }) // 투표 제목
  voteTitle: string;

  @Prop({ required: true, index: true }) // 투표 결과를 확인한 유저 _id
  userId: string;

  @Prop()
  gender: string;

  @Prop()
  ageGroup: string;

  @Prop({ required: true }) // 투표 결과를 확인한 날짜
  createdAt: string;
}

export const VoteStatTicketSchema =
  SchemaFactory.createForClass(VoteStatTicket);

export type VoteStatTicketDocument = VoteStatTicket & Document;
