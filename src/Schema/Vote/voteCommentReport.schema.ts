import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * 신고 대상 투표 댓글 정보.
 * 에러가 나지 않도록 최소한의 정보만 정의합니다.
 * @author 현웅
 */
class VoteComment {
  _id?: string;
  content?: string;
}

/**
 * 투표 (대)댓글 신고 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteCommentReport {
  @Prop({ index: true }) // 신고자 _id
  userId: string;

  @Prop() // 신고자 닉네임
  userNickname: string;

  @Prop({ type: VoteComment }) // 신고 대상 투표 댓글 정보
  comment: Partial<VoteComment>;

  @Prop() // 신고 타입
  type?: string;

  @Prop() // 신고 내용
  content: string;

  @Prop() // 신고 날짜
  createdAt: string;
}

export const VoteCommentReportSchema =
  SchemaFactory.createForClass(VoteCommentReport);

export type VoteCommentReportDocument = VoteCommentReport & Document;
