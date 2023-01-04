import { Injectable } from "@nestjs/common";
const nodemailer = require("nodemailer");
import { authCodeEmailHtml } from "src/Constant";
import { EmailTransmitFailedException } from "src/Exception";

@Injectable()
export class GoogleService {
  constructor() {}

  /**
   * 이메일과 인증코드를 인자로 받아 이메일을 전송합니다.
   * @author 현웅
   */
  async sendAuthCodeEmail(param: { to: string; code: string }) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp-relay.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_OAUTH_USER,
        // clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        // clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        // refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
        serviceClient: process.env.GMAIL_PROJECT_CLIENT_ID,
        privateKey: process.env.GMAIL_PROJECT_CLIENT_PRIVATE_KEY,
      },
    });

    const message = {
      from: "픽플리 <noreply@r2c.company>",
      to: param.to,
      subject: "픽플리(pickply) 인증번호",
      html: authCodeEmailHtml(param.code),
    };

    await transporter
      .sendMail(message)
      .then((info) => {
        // console.log(info.messageId);
        return;
      })
      .catch((err) => {
        throw new EmailTransmitFailedException();
      });
  }
  /**
   * 이메일을 전송합니다.
   * @param to 전송할 이메일 주소
   * @param subject 이메일 제목
   * @param content 이메일 내용
   * @author 현웅
   */
  async sendEmail(param: { to: string; subject: string; content: string }) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp-relay.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_OAUTH_USER,
        serviceClient: process.env.GMAIL_PROJECT_CLIENT_ID,
        privateKey: process.env.GMAIL_PROJECT_CLIENT_PRIVATE_KEY,
      },
    });

    const message = {
      from: "픽플리 <noreply@r2c.company>",
      to: param.to,
      subject: param.subject,
      html: param.content,
    };

    await transporter
      .sendMail(message)
      .then((info) => {
        // console.log(info.messageId);
        return;
      })
      .catch((err) => {
        throw new EmailTransmitFailedException();
      });
  }
}
