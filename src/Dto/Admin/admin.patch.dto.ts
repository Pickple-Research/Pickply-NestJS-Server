import { IsString } from "class-validator";

/** 리서치 블락 처리 요청시 Body 에 포함되어야 하는 정보 */
export class ResearchBlockBodyDto {
  @IsString()
  researchId: string;
}

/** 투표 블락 처리 요청시 Body 에 포함되어야 하는 정보 */
export class VoteBlockBodyDto {
  @IsString()
  voteId: string;
}

/** 리서치/투표 댓글 블락 요성시 Body 에 포함되어야 하는 정보 */
export class CommentBlockBodyDto {
  @IsString()
  commentId: string;
}

/** 리서치/투표 대댓글 블락 요성시 Body 에 포함되어야 하는 정보 */
export class ReplyBlockBodyDto {
  @IsString()
  replyId: string;
}
