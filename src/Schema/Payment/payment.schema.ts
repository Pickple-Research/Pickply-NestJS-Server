import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 결제내역 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Payment {
  @Prop({ required: true }) // 아임포트에서 부여하는 고유 결제 번호
  imp_uid: string;

  @Prop({ required: true }) // 주문내역 _id
  orderId: string;

  @Prop({ required: true }) // 결제 금액
  amount: number;

  @Prop({ required: true }) // 결제 사유
  reason: string;

  @Prop() // 상세 내역 (리서치 제목 등)
  detail?: string;

  @Prop({ required: true, index: true }) // 결제자 _id
  userId: string;

  @Prop({ required: true }) // 결제일자
  createdAt: string;

  @Prop() // 결제 관련 리서치 _id
  researchId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

export type PaymentDocument = Payment & Document;
