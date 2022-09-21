import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 크레딧 사용 내역 스키마입니다.
 * @author 현웅
 */
@Schema()
export class CreditHistory {
  @Prop({ required: true, index: true }) // 유저 _id
  userId: string;

  @Prop({ required: true }) // 변동 사유 (줄글)
  reason: string;

  @Prop({ required: true }) // 변동 타입 (ex. 리서치 등록, 리서치 참여, 리서치 끌올 ...)
  type: string;

  @Prop({ required: true }) // 변동 액수
  scale: number;

  @Prop() // + 요소인지 - 요소인지 여부 (변동 액수가 0 인 경우 대비)
  isIncome: boolean;

  @Prop({ required: true }) // 변동 이후 잔여 크레딧
  balance?: number;

  @Prop({ required: true }) // 변동 일시
  createdAt: string;
}

export const CreditHistorySchema = SchemaFactory.createForClass(CreditHistory);

export type CreditHistoryDocument = CreditHistory & Document;
