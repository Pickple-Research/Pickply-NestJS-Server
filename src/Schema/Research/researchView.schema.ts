import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 리서치 조회 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchView {
  @Prop({ required: true, index: true }) // 조회 대상 리서치 _id
  researchId: string;

  @Prop({ required: true, index: true }) // 조회한 유저 _id
  userId: string;

  @Prop({ required: true }) // 조회 일시
  createdAt: string;
}

export const ResearchViewSchema = SchemaFactory.createForClass(ResearchView);

export type ResearchViewDocument = ResearchView & Document;
