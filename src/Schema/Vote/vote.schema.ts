import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { VoteUser } from "./voteUser.schema";
import {
  VoteOption,
  VoteOptionSchema,
  VoteAnalytics,
  VoteAnalyticsSchema,
} from "./Embedded";

/**
 * 투표 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Vote {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "VoteUser",
  }) // 투표 업로더 정보 (authorId와는 별개로 populate하여 사용)
  author?: VoteUser;

  @Prop({ required: true, index: true }) // 업로더 _id
  authorId: string;

  @Prop({ required: true }) // 투표 제목
  title: string;

  @Prop({ required: true }) // 투표 카테고리
  category: string;

  @Prop({ default: "" }) // 투표 내용
  content?: string;

  @Prop({ required: true, type: [VoteOptionSchema], default: [] }) // 선택지들
  options: VoteOption[];

  @Prop({ required: true, default: false }) // 중복 선택 허용 여부
  allowMultiChoice: boolean;

  @Prop() // 마감일
  deadline?: string;

  @Prop() // 생성 날짜
  createdAt: string;

  //? 앱단에 정보를 넘겨줄 때는 유저 _id를 넘겨줄 필요가 없고 숫자만 넘기면 되는데,
  //? 그 때마다 .length를 사용하여 넘겨주면 (아마도) 좋지 않기에 숫자만 따로 관리합니다.
  @Prop({ default: 0 }) // 조회 수
  viewsNum?: number;

  @Prop({ default: 0 }) // 스크랩 수
  scrapsNum?: number;

  @Prop({ default: 0 }) // 참여자 수
  participantsNum?: number;

  @Prop({ type: [Number] }) // 투표 결과. 각 인덱스의 값은 투표 선택지가 얼마나 선택되었는지 알려줍니다.
  result?: number[];

  @Prop({ default: 0 }) // 비회원 참여자 수
  nonMemberParticipantsNum?: number;

  @Prop({ type: [Number] }) // 비회원 투표 결과. 각 인덱스의 값은 투표 선택지가 얼마나 선택되었는지 알려줍니다.
  nonMemeberResult?: number[];

  @Prop({ type: [VoteAnalyticsSchema], default: [] })
  analytics?: VoteAnalytics[];

  @Prop({ default: 0 }) // (대)댓글 수
  commentsNum?: number;

  @Prop({ type: [String], default: [] }) // (대)댓글을 작성한 유저 _id 목록 (익명 댓글 넘버링 작업을 할 때 사용합니다.)
  commentedUserIds?: string[];

  @Prop({ default: false }) // 종료 여부. deadline이 지나기 전일지라도 사용자가 종료 가능.
  closed?: boolean;

  @Prop({ default: false }) // 숨김 여부
  hidden?: boolean;

  @Prop({ default: false }) // 삭제 여부
  deleted?: boolean;

  @Prop({ default: false }) // (신고 등으로 인한) 블락 여부
  blocked?: boolean;

  @Prop() // 해당 투표에 걸린 이벤트
  eventName?: string;

  @Prop() // 해당 투표에 걸린 이벤트 크레딧 규모
  eventCredit?: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

export type VoteDocument = Vote & Document;
