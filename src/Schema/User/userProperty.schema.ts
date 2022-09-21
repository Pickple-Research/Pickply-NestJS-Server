import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "src/Object/Enum";

/**
 * 유저 특성 정보 스키마입니다.
 * 리서치나 투표 참여시 유저 기본 정보 스키마 대신 이 스키마를 넘겨줍니다.
 * User 스키마의 _id를 공유합니다.
 * @author 현웅
 */
@Schema()
export class UserProperty {
  @Prop() // 성별
  gender: string;

  @Prop() // 출생일 (ISO String 타입)
  birthday: string;

  @Prop() // 수입
  income?: number;

  @Prop() // 거주지
  residence?: string;

  @Prop({ type: [String], enum: Category }) // (유저가 선택한) 관심사 카테고리
  interest?: Category[];

  @Prop({ type: [String], enum: Category }) // (활동 정보를 바탕으로 추론한) 관심사 카테고리
  tendency?: Category[];
}

export const UserPropertySchema = SchemaFactory.createForClass(UserProperty);

export type UserPropertyDocument = UserProperty & Document;
