import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 리서치 참여 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class ResearchParticipation {
  @Prop({ required: true, index: true }) // 참여 대상 리서치 _id
  researchId: string;

  @Prop({ required: true, index: true }) // 참여한 유저 _id
  userId: string;

  @Prop({ required: true }) // 리서치 참여에 걸린 시간
  consumedTime: number;

  @Prop() // 성별
  gender?: string;

  @Prop() // 연령대
  ageGroup?: string;

  @Prop({ required: true }) // 참여 일시
  createdAt: string;
}

export const ResearchParticipationSchema = SchemaFactory.createForClass(
  ResearchParticipation,
);

export type ResearchParticipationDocument = ResearchParticipation & Document;
