import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { Payment, PaymentDocument, Order, OrderDocument } from "src/Schema";

@Injectable()
export class MongoPaymentCreateService {
  constructor(
    @InjectModel(Payment.name) private readonly Payment: Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly Order: Model<OrderDocument>,
  ) {}

  /**
   * 주문 정보를 생성합니다. 결제 완료 이후 결제 금액 대조를 위해 사용합니다.
   * @author 현웅
   */
  async createOrder(param: { order: Order }, session: ClientSession) {
    const newOrders = await this.Order.create([param.order], { session });
    return newOrders[0].toObject();
  }

  /**
   * 결제 정보를 생성합니다.
   * TODO: 결제 정보에 대한 추가 정보가 있는 경우, 생성 후 덧붙입니다.
   * @author 현웅
   */
  async createPayment(
    param: { payment: Payment; otherInfo?: Record<string, any> },
    session: ClientSession,
  ) {
    const newPayments = await this.Payment.create(
      [{ ...param.payment, ...param.otherInfo }],
      { session },
    );
    return newPayments[0].toObject();
  }
}
