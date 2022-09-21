import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 리서치 스크랩 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchScrap {
  @Prop({ required: true, index: true }) // 스크랩 대상 리서치 _id
  researchId: string;

  @Prop({ required: true, index: true }) // 스크랩한 유저 _id
  userId: string;

  @Prop({ required: true }) // 스크랩 일시
  createdAt: string;
}

export const ResearchScrapSchema = SchemaFactory.createForClass(ResearchScrap);

export type ResearchScrapDocument = ResearchScrap & Document;
