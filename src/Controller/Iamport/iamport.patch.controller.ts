import { Controller, Request, Body, Patch, Inject } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { MongoPaymentUpdateService } from "src/Mongo";
import { IamportVerifyPaymentDto } from "src/Dto";
import { MONGODB_PAYMENT_CONNECTION } from "src/Constant";
import { tryMultiTransaction } from "src/Util";
import { JwtUserInfo } from "src/Object/Type";
import { InvalidPaymentException } from "src/Exception";
import { Public } from "src/Security/Metadata";

/**
 * 아임포트 결제 관련 Patch 컨트롤러입니다.
 * @author 현웅
 */
@Controller("iamport")
export class IamportPatchController {
  constructor(
    @InjectConnection(MONGODB_PAYMENT_CONNECTION)
    private readonly paymentConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoPaymentUpdateService: MongoPaymentUpdateService;

  /**
   * 클라이언트 단에서 전송한 결제 내역을 DB 단의 정보와 대조한 후 결제를 확정짓습니다.
   * @author 현웅
   */
  @Patch("verify")
  async verifyPayment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: IamportVerifyPaymentDto,
  ) {
    const { merchant_uid, reason, researchId } = body;

    const paymentSession = await this.paymentConnection.startSession();

    await tryMultiTransaction(async () => {
      const updatedPayment =
        await this.mongoPaymentUpdateService.updatePaymentByMerchantUid(
          {
            merchant_uid,
            updateQuery: {
              $set: {
                reason,
                // userId: req.user.userId,
                researchId,
              },
            },
          },
          paymentSession,
        );

      console.log(updatedPayment);

      if (!updatedPayment || updatedPayment.amount !== body.amount) {
        // 결제 정보가 존재하지 않거나, 결제 금액이 일치하지 않는 경우:
        throw new InvalidPaymentException();
      }
    }, [paymentSession]);

    return;
  }
}
