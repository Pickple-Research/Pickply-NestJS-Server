import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import * as crypto from "crypto";

/**
 * @author 승원
 *
 * ncp sens 관련 함수
 */

@Injectable()
export class SensService {
  constructor(
    private readonly config: ConfigService, // .env
  ) {}

  private makeSignature(): string {
    const message = [];
    // const hmac = crypto.createHmac('sha256', this.config.get('NCP_SECRET_KEY'));
    const hmac = crypto.createHmac("sha256", process.env.NCP_SECRET_KEY);

    const space = " ";
    const newLine = "\n";
    const method = "POST";
    const timestamp = Date.now().toString();
    message.push(method);
    message.push(space);
    // message.push(this.config.get(`/sms/v2/services/${this.config.get('NCP_SERVICE_ID')}/messages`));
    message.push(`/sms/v2/services/${process.env.NCP_SERVICE_ID}/messages`);

    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(process.env.NCP_ACCESS_KEY_ID);
    //message 배열에 위의 내용들을 담아준 후에
    const signature = hmac.update(message.join("")).digest("base64");
    //message.join('') 으로 만들어진 string 을 hmac 에 담고, base64로 인코딩한다
    return signature.toString(); // toString()이 없었어서 에러가 자꾸 났었는데, 반드시 고쳐야함.
  }

  /**
   * @author 승원
   * sms 문자 보내는 함수
   * @param phoneNumber 수신자 전화번호
   * @param name 수신자 성함
   *
   */

  async sendSMS(phoneNumber: string, name: string): Promise<any> {
    const body = {
      type: "LMS",
      contentType: "COMM",
      countryCode: "82",
      from: this.config.get("NCP_NUMBER"), // 발신자 번호
      content: `EXPO 현장 부스를 방문해주셔서 감사드려요!\n픽플리를 내 스마트폰에서도 즐길 수 있게 바로 다운로드 받을 수 있는 링크 전달드립니다 :)\n\nhttps://pickpleresearch.page.link/web \n\n픽플리는 리서치 참여자를 모을 수 있는 플랫폼일 뿐만 아니라,\n다양한 관심사와 취향을 투표 기반으로 공유할 수 있는 커뮤니티입니다.\n\n픽플리에서 내가 필요한 리서치 참여자도 모으고,\n리서치 참여해서 답례품도 받고,\n커뮤니티에서 다양한 투표에 참여하면서 다른 픽플러들과 소통해봐요!\n\n픽플리에 오신 것을 환영해요!`,
      messages: [
        {
          to: phoneNumber, // 수신자 번호
        },
      ],
    };
    const options = {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": process.env.NCP_ACCESS_KEY_ID,
        "x-ncp-apigw-timestamp": Date.now().toString(),
        "x-ncp-apigw-signature-v2": this.makeSignature(),
      },
    };
    // axios.post(`https://sens.apigw.ntruss.com/sms/v2/services/${process.env.NCP_SERVICE_ID}/messages`,
    //     body,
    //     options)
    //     .then(async (res) => {
    //         // 성공 이벤트
    //         console.log(res.data)
    //         res.data?.statusCode;
    //         // console.log(res)
    //     })
    //     .catch((err) => {
    //         console.error(err.response.data);
    //         throw new InternalServerErrorException();

    //         return (err.response.data)
    //     });

    // return {
    //     data: {
    //         statusCode: '202'
    //     }
    // }

    try {
      const { data } = await axios.post(
        `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.NCP_SERVICE_ID}/messages`,
        body,
        options,
      );
      return data;
    } catch (err) {
      console.error(err.response.data);
      return err.response.data;
      //throw new InternalServerErrorException();
    }
  }
}
