import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { Payment, PaymentDocument, Order, OrderDocument } from "src/Schema";

@Injectable()
export class MongoPaymentFindService {
  constructor(
    @InjectModel(Payment.name) private readonly Payment: Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly Order: Model<OrderDocument>,
  ) {}

  /**
   * _id 를 통해 특정 주문 정보를 가져옵니다.
   * @author 현웅
   */
  async getOrderById(orderId: string) {
    return await this.Order.findById(orderId).lean();
  }
}
