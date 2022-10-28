import { IsString, IsNumber, ArrayMinSize, IsOptional } from "class-validator";
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
 * @deprecated #DELETE-AT-YEAR-END - Post 요청으로 이관되었습니다
 *
 * 투표 참여시 Body에 포함되어야 하는 정보들
 * @param selectedOptions 선택한 투표 선택지 index 배열
 * @author 현웅
 */
export class VoteParticipateBodyDtoOld {
  @IsString()
  voteId: string;

  /** 최소 하나 이상의 숫자 배열 */
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsNumber({}, { each: true })
  selectedOptionIndexes: number[];

  @IsString()
  @IsOptional() //TODO: 추후 제거합니다.
  gender?: string;

  @IsString()
  @IsOptional() //TODO: 추후 제거합니다.
  ageGroup?: string;
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
  @IsOptional()
  content?: string;
}

/**
 * 투표에 참여하지 않고 투표 결과 통계만 조회한 후
 * 해당 투표에 참여할 때 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteParticipationUpdateBodyDto {
  @IsString()
  voteId: string;

  @IsString()
  voteParticipationId: string;

  /** 최소 하나 이상의 숫자 배열 */
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsNumber({}, { each: true })
  selectedOptionIndexes: number[];

  @IsString()
  gender: string;

  @IsString()
  ageGroup: string;
}
