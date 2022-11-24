import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { UnableToConnectIamportException } from "src/Exception";

@Injectable()
export class IamportFindService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * 아임포트 엑세스 토큰을 받아옵니다.
   * @author 현웅
   */
  async getIamportAccessToken() {
    const access_token = await this.httpService.axiosRef
      .request({
        method: "POST",
        url: "https://api.iamport.kr/users/getToken",
        headers: { "Content-Type": "application/json" },
        data: {
          imp_key: process.env.IMP_KEY,
          imp_secret: process.env.IMP_SECRET,
        },
      })
      .then((response) => response.data.response.access_token)
      .catch((error) => {
        throw new UnableToConnectIamportException();
      });
    return access_token;
  }

  /**
   * 인자로 받은 imp_uid 로 아임포트 결제 내역을 가져옵니다.
   * access_token 은 getIamportAccessToken() 을 통해 받아옵니다.
   * @author 현웅
   */
  async getIamportPaymentAmount(imp_uid: string) {
    const access_token = await this.getIamportAccessToken();

    const paymentInfo = await this.httpService.axiosRef
      .request({
        method: "GET",
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        headers: { Authorization: access_token },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw new UnableToConnectIamportException();
      });
    return paymentInfo.amount as number;
  }
}
