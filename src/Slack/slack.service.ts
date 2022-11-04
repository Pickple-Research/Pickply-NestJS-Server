import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

/**
 * Slack API 를 사용하기 위한 서비스입니다.
 * Slack Webhook 의 경우 slack app directory > 관리 > 사용자 지정 통합 앱 > 수신 웹후크 에서 설정을 관리합니다.
 * @author 현웅
 */
@Injectable()
export class SlackService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * 개발 채널에 메세지를 보냅니다.
   * @author 현웅
   */
  async sendMessageToSlackDevChannel(param: { message: string }) {
    await this.httpService.axiosRef.request({
      method: "POST",
      url: process.env.SLACK_DEV_CHANNEL_WEBHOOK_URL,
      data: { text: param.message },
    });
  }

  /**
   * 운영 채널에 메세지를 보냅니다.
   * @author 현웅
   */
  async sendMessageToSlackOperationChannel(param: { message: string }) {
    await this.httpService.axiosRef.request({
      method: "POST",
      url: process.env.SLACK_OPERATION_CHANNEL_WEBHOOK_URL,
      data: { text: param.message },
    });
  }
}
