import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession, UpdateQuery } from "mongoose";
import { Payment, PaymentDocument, Order, OrderDocument } from "src/Schema";

@Injectable()
export class MongoPaymentUpdateService {
  constructor(
    @InjectModel(Payment.name) private readonly Payment: Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly Order: Model<OrderDocument>,
  ) {}

  /**
   * _id 를 통해 특정 주문 정보를 찾고 수정합니다.
   * @author 현웅
   */
  async updateOrderById(
    param: { orderId: string; updateQuery?: UpdateQuery<OrderDocument> },
    session?: ClientSession,
  ) {
    return await this.Order.findByIdAndUpdate(
      param.orderId,
      param.updateQuery,
      { session },
    ).lean();
  }

  /**
   * merchant_uid 를 통해 특정 결제 정보를 수정합니다.
   * @author 현웅
   */
  async updatePaymentByMerchantUid(
    param: {
      merchant_uid: string;
      updateQuery?: UpdateQuery<PaymentDocument>;
      selectQuery?: Partial<Record<keyof Payment, boolean>>;
    },
    session: ClientSession,
  ) {
    const updatedPayment = await this.Payment.findOneAndUpdate(
      { merchant_uid: param.merchant_uid },
      param.updateQuery,
      { session },
    )
      .select(param.selectQuery)
      .lean();
    return updatedPayment;
  }
}
