import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 투표 신고 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteReport {
  @Prop() // 신고자 _id
  userId: string;

  @Prop() // 신고자 닉네임
  userNickname: string;

  @Prop() // 신고 대상 투표 _id
  voteId: string;

  @Prop() // 신고 대상 투표 제목
  voteTitle: string;

  @Prop() // 신고 타입
  type?: string;

  @Prop() // 신고 내용
  content: string;

  @Prop() // 신고 날짜
  createdAt: string;
}

export const VoteReportSchema = SchemaFactory.createForClass(VoteReport);

export type VoteReportDocument = VoteReport & Document;
