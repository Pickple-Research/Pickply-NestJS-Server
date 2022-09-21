import { IsString, IsNumber, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

/**
 * 투표를 조회/스크랩/스크랩 취소/마감할 때 Body 에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class VoteInteractBodyDto {
  @IsString()
  voteId: string;
}

/**
 * 투표 참여시 Body에 포함되어야 하는 정보들
 * @param selectedOptions 선택한 투표 선택지 index 배열
 * @author 현웅
 */
export class VoteParticipateBodyDto {
  @IsString()
  voteId: string;

  /** 최소 하나 이상의 숫자 배열 */
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsNumber({}, { each: true })
  selectedOptionIndexes: number[];
}

/**
 * 투표 정보 수정시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteEditBodyDto {
  @IsString()
  voteId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
