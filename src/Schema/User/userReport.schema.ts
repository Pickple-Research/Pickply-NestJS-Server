import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저에 대한 신고 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class UserReport {
  @Prop({ required: true, index: true }) // 신고 대상 유저 _id
  targetUserId: string;

  @Prop({ required: true, index: true }) // 신고한 유저 _id
  reporterId: string;

  @Prop() // 신고 사유
  reason?: string;

  @Prop({ required: true }) // 신고 일시
  createdAt: string;
}

export const UserReportSchema = SchemaFactory.createForClass(UserReport);

export type UserReportDocument = UserReport & Document;
