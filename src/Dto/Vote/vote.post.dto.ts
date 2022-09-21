import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { VoteOptionDto } from "src/Schema/Vote/Embedded";

/**
 * 투표 생성 요청시 Body에 포함되어야 하는 정보들
 * @param title 투표 제목
 * @param category 투표 카테고리
 * @param content 투표 내용
 * @param options 투표 선택지 배열
 * @param allowMultiChoice 중복선택 허용 여부
 * @author 현웅
 */
export class VoteCreateBodyDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => VoteOptionDto)
  options: VoteOptionDto[];

  @IsBoolean()
  allowMultiChoice: boolean;
}

/**
 * 투표 댓글 생성 요청시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteCommentCreateBodyDto {
  @IsString()
  voteId: string;

  @IsString()
  content: string;
}

/**
 * 투표 대댓글 생성 요청시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteReplyCreateBodyDto {
  @IsString()
  voteId: string;

  @IsString()
  commentId: string;

  @IsString()
  targetUserId: string;

  @IsString()
  content: string;
}

/**
 * 투표 신고시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteReportBodyDto {
  @IsString()
  voteId: string;

  @IsString()
  content: string;
}

/**
 * 투표 댓글 신고시 투표 댓글 Type
 * @author 현웅
 */
class VoteComment {
  @IsString()
  @IsOptional() // 댓글 _id
  _id: string;

  @IsString()
  @IsOptional() // 댓글 내용
  content: string;
}

/**
 * 투표 댓글 신고시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteCommentReportBodyDto {
  @ValidateNested({ each: true })
  @Type(() => VoteComment)
  comment: VoteComment;

  @IsString()
  content: string;
}

/**
 * 투표 대댓글 신고시 투표 대댓글 Type
 * @author 현웅
 */
class VoteReply {
  @IsString()
  @IsOptional() // 대댓글 _id
  _id: string;

  @IsString()
  @IsOptional() // 대댓글 내용
  content: string;
}

/**
 * 투표 대댓글 신고시 Body에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteReplyReportBodyDto {
  @ValidateNested({ each: true })
  @Type(() => VoteReply)
  reply: VoteReply;

  @IsString()
  content: string;
}

/**
 * 마이페이지 - 스크랩/참여한 투표 목록을 더 가져올 때 Body 에 포함되어야 하는 정보들
 * @author 현웅
 */
export class VoteMypageBodyDto {
  @IsString({ each: true })
  voteIds: string[];
}
