/** 리서치 소요시간당 차감 크레딧 */
export const CREDIT_PER_MINUTE = (estimatedTime: number) => {
  if (estimatedTime >= 10) return 20;
  if (estimatedTime >= 7) return 15;
  if (estimatedTime >= 4) return 10;
  return 5;
};

/** 리서치 소요시간당 취득 크레딧 */
export const ACHEIVE_CREDIT_PER_MINUTE = (estimatedTime: number) => {
  if (estimatedTime >= 10) return 4;
  if (estimatedTime >= 7) return 3;
  if (estimatedTime >= 4) return 2;
  return 1;
};

/** 리서치 끌올에 필요한 크레딧 */
export const RESEARCH_PULLUP_CREDIT = 1;

/**
 * 리서치 자동 마감 CronJob 을 생성하고 ScheduleRegistry 에 등록할 때
 * 리서치의 _id 앞에 붙이는 문자열. 다음과 같이 사용합니다:
 *
 * @example
 * ```
 * try {
 *   const cronJobName = `RESEARCH_AUTO_CLOSE_CRONJOB_NAME(research._id)`;
 *   const cronJob = new CronJob(...);
 *   this.schedulerRegistry.addCronJob(cronJobName, cronJob);
 * } catch (error) {
 *   ...에러 처리...
 * }
 * ```
 *
 * @author 현웅
 */
export const RESEARCH_AUTO_CLOSE_CRONJOB_NAME = (researchId: string) =>
  `ResearchAutoClose: ${researchId}`;
