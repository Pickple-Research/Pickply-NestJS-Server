import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 유저 별 알림 설정 정보입니다.
 * @author 현웅
 */
@Schema()
export class UserNotificationSetting {
  @Prop({ default: "" }) // 마지막으로 알림을 확인한 시간
  lastCheck?: string;

  @Prop({ default: "" }) // fcm 토큰
  fcmToken?: string;

  @Prop({ required: true }) // 앱 푸시 알림 수신 자체에 대한 설정
  appPush: boolean;

  @Prop() // 크레딧 당첨 알림
  winExtraCredit?: boolean;

  @Prop() // 스크랩한 리서치/투표 디데이 카운트 알림
  scrappedPostDday?: boolean;

  @Prop() // 스크랩한 투표 마감 알림
  scrappedVoteClosed?: boolean;

  @Prop() // 참여한 투표 마감 알림
  participatedVoteClosed?: boolean;

  @Prop() // 댓글/대댓글 알림
  newCommentOrReply?: boolean;

  @Prop() // 이벤트/혜택 알림
  event?: boolean;

  @Prop() // 마케팅 알림
  marketing?: boolean;

  @Prop() // 마케팅 알림
  agreeMarketingDate?: string;
}

export const UserNotificationSettingSchema = SchemaFactory.createForClass(
  UserNotificationSetting,
);

export type UserNotificationSettingDocument = UserNotificationSetting &
  Document;
