import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ProductType } from "src/Object/Enum";

/**
 * 파트너 제품/서비스 스키마입니다.
 * @author 현웅
 */
@Schema()
export class PartnerProduct {
  @Prop() // 파트너 _id
  partnerId: string;

  @Prop({ required: true }) // 제품/서비스명
  productName: string;

  @Prop() // 제품 설명
  description: string;

  @Prop({ enum: ProductType }) // 제품/서비스 타입
  productType: ProductType;

  @Prop() // 가격 (크레딧)
  price?: number;

  @Prop({ type: [String], default: [] }) // 제품 사진
  photoUrls?: string[];
}

export const PartnerProductSchema =
  SchemaFactory.createForClass(PartnerProduct);

export type PartnerProductDocument = PartnerProduct & Document;
