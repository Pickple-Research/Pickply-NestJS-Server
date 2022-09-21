import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * 리서치 경품 스키마입니다
 * @author 현웅
 */
@Schema({ _id: false })
export class ResearchGift {
  @Prop({ required: true }) // 경품 이름
  name: string;

  @Prop({ required: true }) // 추첨 수
  winnerNum: number;
}

export const ResearchGiftSchema = SchemaFactory.createForClass(ResearchGift);
