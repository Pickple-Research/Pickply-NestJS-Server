import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 파트너 게시글/이벤트, 제품/서비스, 리서치, 팔로워에 대한 레퍼런스입니다.
 * @author 현웅
 */
@Schema()
export class PartnerActivity {
  @Prop({ type: [String], default: [] }) // 파트너 게시글/이벤트 _id
  postIds: string[];

  @Prop({ type: [String], default: [] }) // 파트너 제품/서비스 _id
  productIds: string[];

  @Prop({ type: [String], default: [] }) // 파트너가 진행한 리서치 _id
  researchIds: string[];

  @Prop({ type: [String], default: [] }) // 파트너 팔로워 _id
  followerIds: string[];
}

export const PartnerActivitySchema =
  SchemaFactory.createForClass(PartnerActivity);

export type PartnerActivityDocument = PartnerActivity & Document;
