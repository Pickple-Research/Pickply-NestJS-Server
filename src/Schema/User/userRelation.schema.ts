import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저가 차단한 사용자를 관리합니다.
 * @author 현웅
 */
@Schema()
export class UserRelation {
  @Prop({ type: [String], default: [] }) // 차단한 사용자 _id 목록
  blockedUserIds: string[];
}

export const UserRelationSchema = SchemaFactory.createForClass(UserRelation);

export type UserRelationDocument = UserRelation & Document;
