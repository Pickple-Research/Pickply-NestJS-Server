import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ResearchUser } from "./researchUser.schema";
import { Category } from "src/Object/Enum";

/**
 * 리서치 기본 정보 스키마입니다.
 * @author 현웅
 */
@Schema()
export class Research {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ResearchUser",
  }) // 리서치 업로더 정보 (authorId와는 별개로 populate하여 사용)
  author?: ResearchUser;

  @Prop({ required: true, index: true }) // 리서치 업로더 _id
  authorId: string;

  @Prop({ required: true }) // 리서치 제목
  title: string;

  @Prop({ default: "UNDEFINED" }) // 리서치 카테고리
  category?: string;

  @Prop({ required: true }) // 설문지 폼 url (변환 형태)
  link: string;

  @Prop() // 설문지 폼 원본 url
  originalLink?: string;

  @Prop({ required: true }) // 리서치 내용
  content: string;

  @Prop({ required: true }) // 리서치 목적 (학술, 개인, 기타, ...)
  purpose: string;

  @Prop({ required: true }) // 리서치 종류 (설문조사, 실험참여, UIUX 설문, ...)
  type: string;

  @Prop({ type: [String], default: [], enum: Category }) // 리서치 카테고리
  categories?: Category[];

  @Prop() // 리서치 진행 단체
  organization: string;

  @Prop() // 참여 대상 (줄글 작성)
  target: string;

  @Prop({ type: [String], default: [] }) // 참여 성별 조건
  targetGenders?: string[];

  @Prop({ type: [Number], default: [] }) // 참여 나이 조건
  targetAges?: number[];

  @Prop({ type: [String], default: [] }) // 참여 나이대 조건
  targetAgeGroups?: string[];

  @Prop({ required: true }) // 예상 소요시간
  estimatedTime: number;

  @Prop() // 참여시 제공 크레딧
  credit: number;

  @Prop() // 참여시 추가 제공 크레딧 (추첨자에게만 제공)
  extraCredit: number;

  @Prop() // 추가 제공 크레딧 추첨 수령자 수
  extraCreditReceiverNum: number;

  @Prop({ default: false }) // 추가 제공 크레딧 분배 완료 여부
  creditDistributed?: boolean;

  @Prop() // 마감일
  deadline: string;

  //! 끌올한 날짜. 리서치는 _id가 아니라 이 일자를 기준으로 노출됩니다.
  //* 끌올하기 전에는 생성일과 같습니다.
  @Prop({ index: true, required: true })
  pulledupAt: string;

  @Prop() // 생성일
  createdAt: string;

  //? 앱단에 정보를 넘겨줄 때는 유저 _id를 넘겨줄 필요가 없고 숫자만 넘기면 되는데,
  //? 그 때마다 .length를 사용하여 넘겨주면 (아마도) 좋지 않기에 숫자만 따로 관리합니다.
  @Prop({ default: 0 }) // 조회 수
  viewsNum?: number;

  @Prop({ default: 0 }) // 스크랩 수
  scrapsNum?: number;

  @Prop({ default: 0 }) // 참여자 수
  participantsNum?: number;

  @Prop({ default: 0 }) // 비회원 참여자 수
  nonMemberParticipantsNum?: number;

  @Prop({ default: 0 }) // 댓글 수
  commentsNum?: number;

  @Prop({ default: false }) // 종료 여부. deadline이 지나기 전일지라도 사용자가 종료 가능.
  closed?: boolean;

  @Prop({ default: false }) // 리서치 게시 승인 여부
  confirmed?: boolean;

  @Prop({ default: false }) // 숨김 여부
  hidden?: boolean;

  @Prop({ default: false }) // 삭제 여부
  deleted?: boolean;

  @Prop({ default: false }) // (신고 등으로 인한) 블락 여부
  blocked?: boolean;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);

export type ResearchDocument = Research & Document;
