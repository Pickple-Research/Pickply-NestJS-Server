import { Controller, Body, Post, Inject, Req } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoPaymentCreateService } from "src/Mongo";
import { IamportFindService } from "src/Service";
import { JwtUserInfo } from "src/Object/Type";
import { IamportCreateOrderDto } from "src/Dto";
import { Order, Payment } from "src/Schema";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { Public } from "src/Security/Metadata";
import { MONGODB_PAYMENT_CONNECTION } from "src/Constant";

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
   * 앱단에서 아임포트 결제 프로세스를 진행하기 전에 호출하는 API 입니다.
   * 결제 진행 전에 주문 정보를 생성합니다.
   * @author 현웅
   */
  @Post("order")
  async createOrder(
    @Req() req: { user: JwtUserInfo },
    @Body() body: IamportCreateOrderDto,
  ) {
    const order: Order = {
      userId: req.user.userId,
      reason: body.reason,
      amount: body.amount,
      researchId: body.researchId,
      createdAt: getCurrentISOTime(),
    };

    const paymentSession = await this.paymentConnection.startSession();

    await tryMultiTransaction(async () => {
      await this.mongoPaymentCreateService.createOrder(
        { order },
        paymentSession,
      );
    }, [paymentSession]);

    return;
  }

  /**
   * 앱단에서 아임포트를 이용해 결제를 완료하는 경우 아임포트 웹훅을 통해 자동으로 호출되는 API 입니다.
   * 결제 정보 (imp_uid, merchant_uid, amount) 를 아임포트로부터 가져와 DB에 저장합니다.
   * @author 현웅
   */
  @Public()
  @Post("webhook/paid")
  async iamportPaidWebhook(
    @Body() body: { imp_uid: string; merchant_uid: string },
  ) {
    const paymentResponse =
      await this.iamportFindService.getIamportPaymentAmount(body.imp_uid);
    const { amount, ...otherInfo } = paymentResponse;

    const payment: Payment = {
      imp_uid: body.imp_uid,
      orderId: body.merchant_uid,
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
