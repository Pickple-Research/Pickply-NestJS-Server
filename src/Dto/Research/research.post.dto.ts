import {
  IsString,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * 리서치 생성 요청시 Body에 포함되어야 하는 정보들입니다.
 * @param title 리서치 제목
 * @param link 설문지 폼 url
 * @param originalLink 설문지 폼 원본 url
 * @param content 리서치 내용
 * @param purpose 리서치 목적
 * @param type 리서치 종류
 * @param organization 리서치 진행 단체
 * @param target 참여 대상 (줄글 작성)
 * @param targetGenders 참여 성별 조건
 * @param targetAges 참여 나이 조건
 * @param targetAgeGroups 참여 나이대 조건
 * @param estimatedTime 예상 소요시간
 * @param extraCredit 참여시 추가 제공 크레딧 (추첨자에게만 제공)
 * @param extraCreditReceiverNum 추가 제공 크레딧 추첨 수령자 수
 * @param deadline 마감일
 * @author 현웅
 */
export class ResearchCreateBodyDto {
  @IsString() // 리서치 제목
  title: string;

  @IsString() // 리서치 카테고리
  @IsOptional()
  category: string;

  @IsString() // 설문지 폼 url
  link: string;

  @IsString() // 설문지 폼 url
  @IsOptional() // 설문지 폼 원본 url
  originalLink?: string;

  @IsString() // 리서치 내용
  content: string;

  @IsString() // 리서치 목적
  purpose: string;

  @IsString() // 리서치 종류
  type: string;

  @IsString() // 리서치 진행 단체
  organization: string;

  @IsString() // 참여 대상 (줄글 작성)
  target: string;

  @IsString({ each: true }) // 참여 성별 조건
  targetGenders: string[];

  @IsString({ each: true }) // 참여 나이 조건
  @IsOptional()
  targetAges: number[];

  @IsString({ each: true }) // 참여 나이대 조건
  targetAgeGroups: string[];

  @IsNumberString() // 예상 소요시간
  estimatedTime: number;

  @IsNumberString() // 참여시 추가 제공 크레딧 (추첨자에게만 제공)
  extraCredit: number;

  @IsNumberString() // 추가 제공 크레딧 추첨 수령자 수
  extraCreditReceiverNum: number;

  @IsString() // 마감일
  deadline: string;
}

/**
 * 리서치 댓글 생성 요청시 Body에 포함되어야 하는 정보들
 * @param content
 * @author 현웅
 */
export class ResearchCommentCreateBodyDto {
  @IsString()
  researchId: string;

  @IsString()
  content: string;
}

/**
 * 리서치 대댓글 생성 요청시 Body에 포함되어야 하는 정보들
 * @param content
 * @author 현웅
 */
export class ResearchReplyCreateBodyDto {
  @IsString()
  researchId: string;

  @IsString()
  commentId: string;

  @IsString()
  targetUserId: string;

  @IsString()
  content: string;
}

/**
 * 리서치 신고시 Body에 포함되어야 하는 정보들
 * @param content
 * @author 현웅
 */
export class ResearchReportBodyDto {
  @IsString()
  researchId: string;

  @IsString()
  content: string;
}

/**
 * 리서치 댓글 신고시 리서치 댓글 Type
 * @author 현웅
 */
class ResearchComment {
  @IsString()
  @IsOptional() // 댓글 _id
  _id: string;

  @IsString()
  @IsOptional() // 댓글 내용
  content: string;
}

/**
 * 리서치 댓글 신고시 Body에 포함되어야 하는 정보들
 * @param content
 * @author 현웅
 */
export class ResearchCommentReportBodyDto {
  @ValidateNested({ each: true })
  @Type(() => ResearchComment)
  comment: ResearchComment;

  @IsString()
  content: string;
}

/**
 * 리서치 대댓글 신고시 리서치 대댓글 Type
 * @author 현웅
 */
class ResearchReply {
  @IsString()
  @IsOptional() // 대댓글 _id
  _id: string;

  @IsString()
  @IsOptional() // 대댓글 내용
  content: string;
}

/**
 * 리서치 대댓글 신고시 Body에 포함되어야 하는 정보들
 * @param content
 * @author 현웅
 */
export class ResearchReplyReportBodyDto {
  @ValidateNested({ each: true })
  @Type(() => ResearchReply)
  reply: ResearchReply;

  @IsString()
  content: string;
}

/**
 * 마이페이지 - 스크랩/참여한 리서치 목록을 더 가져올 때 Body 에 포함되어야 하는 정보들
 * @author 현웅
 */
export class ResearchMypageBodyDto {
  @IsString({ each: true })
  researchIds: string[];
}
