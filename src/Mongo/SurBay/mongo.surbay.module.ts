import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoSurBayService } from "./mongo.surbay.service";
import { SurBayUserSchema } from "src/Schema";
import { MONGODB_SURBAY_CONNECTION } from "src/Constant";

@Module({
  providers: [MongoSurBayService],
  imports: [
    MongooseModule.forFeature(
      [
        //! 혼선을 방지하기 위해 스키마 이름은 SurBayUser로 했지만 DB에 정의하는 이름은 User여야 합니다.
        { name: "User", schema: SurBayUserSchema },
      ],
      MONGODB_SURBAY_CONNECTION,
    ),
  ],
  exports: [MongoSurBayService],
})
export class MongoSurBayModule {}
