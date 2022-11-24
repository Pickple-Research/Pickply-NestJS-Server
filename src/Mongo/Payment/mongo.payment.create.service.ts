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
   * 주문 정보를 생성합니다. 이후 결제할 때 대조를 위해 사용합니다.
   * @author 현웅
   */
  async createOrder(param: { order: Order }, session: ClientSession) {
    await this.Order.create([param.order], { session });
  }

  /**
   * 결제 정보를 생성합니다.
   * @author 현웅
   */
  async createPayment(param: { payment: Payment }, session: ClientSession) {
    const newPayments = await this.Payment.create([param.payment], { session });
    return newPayments[0].toObject();
  }
}
