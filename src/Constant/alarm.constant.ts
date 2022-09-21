export const NEW_COMMENT_ALRAM_TITLE = "댓글 알림";
export const NEW_COMMENT_ALRAM_CONTENT =
  "내 게시글에 댓글이 달렸어요! 지금 바로 확인해보세요";

export const NEW_REPLY_ALRAM_TITLE = "댓글 알림";
export const NEW_REPLY_ALRAM_CONTENT =
  "내 댓글에 대댓글이 달렸어요! 지금 바로 확인해보세요";

/** 리서치 추가 크레딧 당첨 푸시 알림 제목 */
export const WIN_EXTRA_CREDIT_ALARM_TITLE = "추가 크레딧 당첨";

/** 리서치 추가 크레딧 당첨 푸시 알림 내용 */
export const WIN_EXTRA_CREDIT_ALARM_CONTENT = (param: {
  extraCredit: number;
}) =>
  `${param.extraCredit}만큼의 추가 크레딧에 당첨되었어요!\n\n마이페이지에 들어가 지금 확인해보세요!`;
