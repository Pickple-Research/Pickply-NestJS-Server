import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class SurBayUser {
  @Prop() // SurBay 정보가 픽플리로 이관되었는지 여부
  migrated: boolean;

  @Prop({ unique: true, trim: true })
  userID: string;
  @Prop()
  userPassword: string;
  @Prop({ unique: true, trim: true })
  name: string;
  @Prop()
  email: string;
  @Prop({ default: 0 })
  points: number;
  @Prop()
  jsonWebToken: string;
  @Prop({ default: 1 })
  level: number;
  @Prop({ type: [String], default: [] })
  participations: string[];
  @Prop({ default: 2 })
  gender: number;
  @Prop({ default: 0 })
  yearBirth: number;
  @Prop({ trim: true })
  phoneNumber: string;
  @Prop({ type: [String], default: [] })
  prizes: string[];
  @Prop({ default: 0 })
  prize_check: number;
  @Prop()
  email_confirmed: boolean;
  @Prop()
  password_change: boolean;
  @Prop()
  last_password_confirm_time: Date;
  @Prop()
  fcm_token: string;
  @Prop({ type: [String], default: [] })
  notifications: string[];
  @Prop()
  notification_allow: boolean;
  @Prop({ type: [String], default: [] })
  blocked_users: string[];
  @Prop({ type: [String], default: [] })
  general_participations: string[];
  @Prop({ type: [String], default: [] })
  my_generals: string[];
  @Prop({ type: [String], default: [] })
  my_posts: string[];
  @Prop()
  createdAt: Date;
  @Prop()
  loginAt: Date;
}

export const SurBayUserSchema = SchemaFactory.createForClass(SurBayUser);

export type SurBayUserDocument = SurBayUser & Document;
