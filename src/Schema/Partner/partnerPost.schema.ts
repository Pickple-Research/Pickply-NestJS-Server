import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 파트너 게시글/이벤트 스키마입니다.
 * @author 현웅
 */
@Schema()
export class PartnerPost {
  @Prop() // 파트너 _id
  partnerId: string;

  @Prop({ required: true }) // 게시글/이벤트 제목
  title: string;

  @Prop({ required: true }) // 내용
  content: string;

  @Prop() // 게시 일자
  createdAt: string;

  @Prop({ type: [String], default: [] }) // 사진 url
  photoUrls?: string[];
}

export const PartnerPostSchema = SchemaFactory.createForClass(PartnerPost);

export type PartnerPostDocument = PartnerPost & Document;
