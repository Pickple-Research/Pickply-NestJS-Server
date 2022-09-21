import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저 개인 정보 스키마입니다. 정보는 직접 저장되지 않으며, 단방향 암호화를 통해 암호화되어 저장됩니다.
 * @author 현웅
 */
@Schema()
export class UserPrivacy {
  @Prop() // 성
  lastName?: string;

  @Prop() // 이름
  name?: string;

  @Prop() // 주소
  address?: string;

  @Prop() // 전화번호
  phoneNumber?: string;
}

export const UserPrivacySchema = SchemaFactory.createForClass(UserPrivacy);

export type UserPrivacyDocument = UserPrivacy & Document;
