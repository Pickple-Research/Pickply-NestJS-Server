import { Controller, Body, Post, Inject, Req } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  MongoResearchUpdateService,
  MongoPaymentFindService,
  MongoPaymentCreateService,
  MongoPaymentUpdateService,
} from "src/Mongo";
import { IamportFindService } from "src/Service";
import { GoogleService } from "src/Google";
import { JwtUserInfo } from "src/Object/Type";
import { IamportCreateOrderDto } from "src/Dto";
import { Order, Payment } from "src/Schema";
import { getCurrentISOTime, tryMultiTransaction } from "src/Util";
import { Public } from "src/Security/Metadata";
import {
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_PAYMENT_CONNECTION,
} from "src/Constant";
import { InvalidPaymentException } from "src/Exception";

/**
 * 아임포트 결제 관련 Post 컨트롤러입니다.
 * @author 현웅
 */
@Controller("iamport")
export class IamportPostController {
  constructor(
    private readonly iamportFindService: IamportFindService,

    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_PAYMENT_CONNECTION)
    private readonly paymentConnection: Connection,
  ) {}

  @Inject()
  private readonly googleService: GoogleService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
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
      detail: body.detail,
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
   * 앱단에서 아임포트를 이용해 결제를 완료하는 경우 아임포트 사의 웹훅을 통해 자동으로 호출되는 API 입니다.
   * 결제 정보 (imp_uid, merchant_uid, amount) 를 아임포트로부터 가져와 DB 에 존재하는 주문 정보와 비교합니다.
   * 이 때, merchant_uid 는 주문 정보의 _id 와 동일합니다.
   * @author 현웅
   */
  @Public()
  @Post("webhook/paid")
  async iamportPaidWebhook(
    @Body() body: { imp_uid: string; merchant_uid: string },
  ) {
    //* DB 단의 주문 정보를 가져옵니다. (결제 전에 "[POST] /iamport/order" 요청으로 생성하였던 정보)
    const getOrderInfo = this.mongoPaymentFindService.getOrderById(
      body.merchant_uid,
    );
    //* 아임포트 사의 결제 정보를 가져옵니다.
    const getPaymentResponse = this.iamportFindService.getIamportPaymentAmount(
      body.imp_uid,
    );
    //* 위의 두 함수를 동시에 실행
    const { orderInfo, paymentResponse } = await Promise.all([
      getOrderInfo,
      getPaymentResponse,
    ]).then(([orderInfo, paymentResponse]) => {
      return { orderInfo, paymentResponse };
    });

    const { amount, ...additionalInfo } = paymentResponse;

    /**
     * 결제에 대한 주문 정보가 없거나, 주문 정보의 금액과 결제 금액이 다른 경우: 에러
     */
    if (!orderInfo || orderInfo.amount !== amount)
      throw new InvalidPaymentException();

    // 주문 정보와 결제 정보가 일치하는 경우, 주문 정보로부터 정보를 가져온 후 결제 정보를 생성
    const payment: Payment = {
      imp_uid: body.imp_uid,
      orderId: body.merchant_uid,
      amount,
      userId: orderInfo.userId,
      reason: orderInfo.reason,
      detail: orderInfo.detail,
      researchId: orderInfo.researchId,
      createdAt: getCurrentISOTime(),
    };

    const researchSession = await this.researchConnection.startSession();
    const paymentSession = await this.paymentConnection.startSession();

    await tryMultiTransaction(async () => {
      //* 결제 정보 생성
      const newPayment = await this.mongoPaymentCreateService.createPayment(
        { payment, additionalInfo },
        paymentSession,
      );
      //* 결제된 리서치 정보의 paid 속성을 true 로 변경하고, paymentId 를 반영합니다.
      await this.mongoResearchUpdateService.updateResearchById(
        {
          researchId: orderInfo.researchId,
          updateQuery: {
            $set: { paid: true, paymentId: newPayment._id.toString() },
          },
        },
        researchSession,
      );

      //* 생성된 결제 정보 _id 를 주문 정보에 추가 (session 은 사용하지 않습니다.)
      await this.mongoPaymentUpdateService.updateOrderById({
        orderId: body.merchant_uid,
        updateQuery: { $set: { paymentId: newPayment._id.toString() } },
      });
    }, [researchSession, paymentSession]);

    return;
  }
}
