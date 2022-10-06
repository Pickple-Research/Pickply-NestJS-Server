import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class SlackService {
  constructor(private readonly axios: HttpService) {}

  /**
   * 개발 채널에 메세지를 보냅니다.
   * @author 현웅
   */
  async sendSlackMessageToDevChannel(param: { message: string }) {
    console.log(`send message to slack...`);
    this.axios.request({
      method: "POST",
      url: process.env.SLACK_DEV_CHANNEL_WEBHOOK_URL,
      data: { text: param.message },
    });
  }
}
