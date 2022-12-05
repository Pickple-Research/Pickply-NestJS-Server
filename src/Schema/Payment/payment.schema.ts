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

  @Prop({ required: true }) // 결제일자
  createdAt: string;

  //* 아래 Prop 들은 결제 내역에 필수적인 요소들이지만 처음 웹훅을 통해 데이터를 생성할 때에는 전달되지 않으므로 optional 하게 설정합니다.
  @Prop() // 결제 사유
  reason?: string;

  @Prop({ index: true }) // 결제자 _id
  userId?: string;

  @Prop() // 결제 관련 리서치 _id
  researchId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

export type PaymentDocument = Payment & Document;
