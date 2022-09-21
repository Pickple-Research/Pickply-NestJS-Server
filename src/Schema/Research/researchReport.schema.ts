import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 리서치 신고 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchReport {
  @Prop() // 신고자 _id
  userId: string;

  @Prop() // 신고자 닉네임
  userNickname: string;

  @Prop() // 신고 대상 리서치 _id
  researchId: string;

  @Prop() // 신고 대상 리서치 제목
  researchTitle: string;

  @Prop() // 신고 타입
  type?: string;

  @Prop() // 신고 내용
  content: string;

  @Prop() // 신고 날짜
  createdAt: string;
}

export const ResearchReportSchema =
  SchemaFactory.createForClass(ResearchReport);

export type ResearchReportDocument = ResearchReport & Document;
