import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저 별로 관리되는 공지사항 정보입니다.
 * @author 현웅
 */
@Schema()
export class UserNotice {
  @Prop({ default: "" }) // 마지막으로 공지를 확인한 시각
  lastCheck: string;

  @Prop({ type: [String], default: [] }) // 확인한 공지 _id
  checkedNoticeIds?: string[];
}

export const UserNoticeSchema = SchemaFactory.createForClass(UserNotice);

export type UserNoticeDocument = UserNotice & Document;
