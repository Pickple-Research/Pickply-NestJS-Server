import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString } from "class-validator";

/**
 * 투표 선택지 스키마
 * @param content 선택지 내용
 * @author 현웅
 */
@Schema({ _id: false })
export class VoteOption {
  @Prop()
  content: string;
}

/**
 * 투표 선택지 스키마의 class-validator 형태입니다.
 * Dto에서 선택지 타입의 배열을 인자로 설정해야 할 때 사용합니다.
 * @author 현웅
 */
export class VoteOptionDto {
  @IsString()
  content: string;
}

export const VoteOptionSchema = SchemaFactory.createForClass(VoteOption);
