import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저별 알림 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Notification {
  @Prop({ required: true, index: true }) // 알림 대상 유저
  userId: string;

  @Prop({ required: true }) // 알림 타입
  type: string;

  @Prop({ required: true }) // 알림 제목
  title: string;

  @Prop({ required: true }) // 알림 내용
  content: string;

  @Prop() // 알림 세부 내용 (리서치/투표 제목)
  detail?: string;

  @Prop({ default: false }) // 알림 확인 여부
  checked?: boolean;

  @Prop({ required: true }) // 알림 생성 시간
  createdAt: string;

  @Prop() // 리서치 _id
  researchId?: string;

  @Prop() // 투표 _id
  voteId?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = Notification & Document;
