import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 주문 내역 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Order {
  @Prop({ required: true }) // 주문 내역 사유
  reason: string;

  @Prop({ required: true }) // 주문자 _id
  userId: string;

  @Prop() // 주문 관련 리서치 _id
  researchId?: string;

  @Prop({ required: true }) // 결제 예정 금액
  amount: number;

  @Prop({ default: "" }) // 결제 _id. 결제 완료 후 값이 부여됩니다.
  paymentId?: string;

  @Prop() // 생성일자
  createdAt: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export type OrderDocument = Order & Document;
