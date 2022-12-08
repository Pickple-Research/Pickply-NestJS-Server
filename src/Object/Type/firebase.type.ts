import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

/**
 * Firebase 푸시 알림을 보낼 때 포함되어야 하는 정보입니다.
 * ```
 * type TokenMessage = {
 *   token: string;
 *   notification: {
 *     title: string;
 *     body: string;
 *   }
 * }
 * ```
 * @author 현웅
 */
export type PushAlarm = TokenMessage & {
  // (TokenMessage)
  // token: string;
  // notification: {
  //     title: string;
  //     body: string;
  // };
  data?: {
    notificationId: string;
    type: string;
    detail?: string;
    researchId?: string;
    voteId?: string;
    outerLink?: string;
    inAppLink?: string;
  };
};
