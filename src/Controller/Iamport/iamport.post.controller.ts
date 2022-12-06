import { Controller, Body, Post, Inject, Req } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoPaymentFindService,
  MongoPaymentCreateService,
  MongoPaymentUpdateService,
} from "src/Mongo";
import { IamportFindService } from "src/Service";
import { JwtUserInfo } from "src/Object/Type";
import { IamportCreateOrderDto } from "src/Dto";
import { Order, Payment } from "src/Schema";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { Public } from "src/Security/Metadata";
import { MONGODB_PAYMENT_CONNECTION } from "src/Constant";
import { InvalidPaymentException } from "src/Exception";

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
  private readonly mongoPaymentFindService: MongoPaymentFindService;
  @Inject()
  private readonly mongoPaymentCreateService: MongoPaymentCreateService;
  @Inject()
  private readonly mongoPaymentUpdateService: MongoPaymentUpdateService;

  /**
   * 앱단에서 아임포트 결제 프로세스를 진행하기 전에 호출하는 API 입니다.
   * 결제 진행 전에 주문 정보를 생성합니다.
   *
   * @return 생성된 주문 정보
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

    return await tryMultiTransaction(async () => {
      return await this.mongoPaymentCreateService.createOrder(
        { order },
        paymentSession,
      );
    }, [paymentSession]);
  }

  /**
   * 앱단에서 아임포트를 이용해 결제를 완료하는 경우 아임포트 웹훅을 통해 자동으로 호출되는 API 입니다.
   * 결제 정보 (imp_uid, merchant_uid, amount) 를 아임포트로부터 가져와 DB 에 존재하는 주문 정보와 비교합니다.
   * @author 현웅
   */
  @Public()
  @Post("webhook/paid")
  async iamportPaidWebhook(
    @Body() body: { imp_uid: string; merchant_uid: string },
  ) {
    const getOrderInfo = this.mongoPaymentFindService.getOrderById(
      body.merchant_uid,
    );

    const getPaymentResponse = this.iamportFindService.getIamportPaymentAmount(
      body.imp_uid,
    );

    const { orderInfo, paymentResponse } = await Promise.all([
      getOrderInfo,
      getPaymentResponse,
    ]).then(([orderInfo, paymentResponse]) => {
      return { orderInfo, paymentResponse };
    });

    const { amount, ...otherInfo } = paymentResponse;

    /**
     * 결제에 대한 주문 정보가 없거나, 주문 정보의 금액과 결제 금액이 다른 경우: 에러
     */
    if (!orderInfo || orderInfo.amount !== amount)
      throw new InvalidPaymentException();

    // 결제가 정상적으로 이루어진 경우, 주문 정보로부터 정보를 가져온 후 결제 정보를 생성
    const payment: Payment = {
      imp_uid: body.imp_uid,
      orderId: body.merchant_uid,
      amount,
      userId: orderInfo.userId,
      reason: orderInfo.reason,
      researchId: orderInfo.researchId,
      createdAt: getCurrentISOTime(),
    };

    const paymentSession = await this.paymentConnection.startSession();

    await tryMultiTransaction(async () => {
      //* 결제 정보 생성
      const newPayment = await this.mongoPaymentCreateService.createPayment(
        { payment, otherInfo },
        paymentSession,
      );
      //* 생성된 결제 정보 _id 를 주문 정보에 추가 (session 은 사용하지 않습니다.)
      await this.mongoPaymentUpdateService.updateOrderById({
        orderId: body.merchant_uid,
        updateQuery: { $set: { paymentId: newPayment._id.toString() } },
      });
    }, [paymentSession]);

    return;
  }
}
