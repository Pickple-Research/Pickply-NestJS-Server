import { Controller, Body, Post, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoPaymentCreateService } from "src/Mongo";
import { IamportFindService } from "src/Service";
import { Public } from "src/Security/Metadata";
import { MONGODB_PAYMENT_CONNECTION } from "src/Constant";
import { Payment } from "src/Schema";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";

/**
 * 아임포트 결제 관련 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("iamport")
export class IamportPostController {
  constructor(
    private readonly iamportFindService: IamportFindService,

    @InjectConnection(MONGODB_PAYMENT_CONNECTION)
    private readonly paymentConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoPaymentCreateService: MongoPaymentCreateService;

  /**
   * 앱단에서 아임포트를 이용해 결제를 완료하는 경우 아임포트 웹훅을 통해 자동으로 호출되는 API 입니다.
   * 결제 정보 (imp_uid, merchant_uid, amount) 를 아임포트로부터 가져와 DB에 저장합니다.
   * @author 현웅
   */
  @Public()
  @Post("webhook/paid")
  async webhookTest(@Body() body: { imp_uid: string; merchant_uid: string }) {
    const paymentResponse =
      await this.iamportFindService.getIamportPaymentAmount(body.imp_uid);
    const { amount, ...otherInfo } = paymentResponse;

    const payment: Payment = {
      imp_uid: body.imp_uid,
      merchant_uid: body.merchant_uid,
      amount,
      userId: "",
      createdAt: getCurrentISOTime(),
    };

    const paymentSession = await this.paymentConnection.startSession();

    await tryMultiTransaction(async () => {
      await this.mongoPaymentCreateService.createPayment(
        { payment, otherInfo },
        paymentSession,
      );
    }, [paymentSession]);

    return;
  }
}
