import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoPaymentCreateService } from "./mongo.payment.create.service";
import { MongoPaymentUpdateService } from "./mongo.payment.update.service";
import { Payment, PaymentSchema, Order, OrderSchema } from "src/Schema";
import { MONGODB_PAYMENT_CONNECTION } from "src/Constant";

@Module({
  providers: [MongoPaymentCreateService, MongoPaymentUpdateService],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Payment.name, schema: PaymentSchema },
        { name: Order.name, schema: OrderSchema },
      ],
      MONGODB_PAYMENT_CONNECTION,
    ),
  ],
  exports: [MongoPaymentCreateService, MongoPaymentUpdateService],
})
export class MongoPaymentModule {}
