import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { VoteUser } from "./voteUser.schema";

/**
 * 투표 대댓글 스키마입니다.
 * @author 현웅
 */
@Schema()
export class VoteReply {
  @Prop({ required: true }) // 투표 _id
  voteId: string;

  @Prop({ required: true, index: true }) // 댓글 _id
  commentId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "VoteUser",
  }) // 투표 댓글 작성자 정보 (authorId와는 별개로 populate하여 사용)
  author?: VoteUser;

  @Prop({ required: true }) // 작성자 _id
  authorId: string;

  @Prop({ required: true }) // 대댓글 내용
  content: string;

  @Prop({ default: false }) // 블락 여부
  blocked?: boolean;

  @Prop({ default: false }) // 삭제 여부
  deleted?: boolean;

  @Prop({ required: true }) // 작성 날짜
  createdAt: string;
}

export const VoteReplySchema = SchemaFactory.createForClass(VoteReply);

export type VoteReplyDocument = VoteReply & Document;
