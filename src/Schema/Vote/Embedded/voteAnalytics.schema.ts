import { Prop, Schema, raw, SchemaFactory } from "@nestjs/mongoose";

/**
 * 투표 결과
 * @author 현웅
 */
@Schema({ _id: false })
export class VoteAnalytics {
  //* 선택지별 성별/나이 정보 저장
  @Prop(
    raw({
      TEEN: { type: Number, default: 0 },
      TWENTY: { type: Number, default: 0 },
      THIRTY: { type: Number, default: 0 },
      FOURTY: { type: Number, default: 0 },
      FIFTY: { type: Number, default: 0 },
      SIXTY: { type: Number, default: 0 },
      SEVENTY: { type: Number, default: 0 },
    }),
  )
  MALE: Record<string, number>;

  @Prop(
    raw({
      TEEN: { type: Number, default: 0 },
      TWENTY: { type: Number, default: 0 },
      THIRTY: { type: Number, default: 0 },
      FOURTY: { type: Number, default: 0 },
      FIFTY: { type: Number, default: 0 },
      SIXTY: { type: Number, default: 0 },
      SEVENTY: { type: Number, default: 0 },
    }),
  )
  FEMALE: Record<string, number>;
}

export const initialVoteAnalytics: VoteAnalytics = {
  MALE: {},
  FEMALE: {},
};

export const VoteAnalyticsSchema = SchemaFactory.createForClass(VoteAnalytics);
