import { Injectable } from "@nestjs/common";
import admin from "firebase-admin";
//! 필요한 정보만 .env 로 옮겨서 관리하고 있습니다.
// import * as account from "./r2c-pickpleresearch-firebase-adminsdk-7ykfc-8627d5f061.json";
import { TokenMessage } from "firebase-admin/lib/messaging/messaging-api";

@Injectable()
export class FirebaseService {
  constructor() {
    //! 왠진 모르겠지만 아래처럼 require로 가져오면 에러가 납니다. import 로 가져옵시다.
    // const serviceAccount = require("./r2c-pickpleresearch-firebase-adminsdk-7ykfc-8627d5f061.json");
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      admin.app();
    }
  }

  /**
   * 인자로 주어진 내용을 푸쉬 알람 형태로 유저에게 전송합니다.
   * @author 현웅
   */
  async sendPushAlarm(message: TokenMessage) {
    try {
      await admin.messaging().send(message);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * 여러 개의 푸시 알림을 전송합니다.
   * ! 푸쉬 알림 전송 도중 에러가 나면 서버가 터지므로 반드시 try catch로 실행합니다
   * @author 현웅
   */
  async sendMultiplePushAlarm(messages: TokenMessage[]) {
    try {
      return await admin.messaging().sendAll(messages);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
