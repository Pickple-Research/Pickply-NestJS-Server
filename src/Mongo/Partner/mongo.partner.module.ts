import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  MongoPartnerCreateService,
  MongoPartnerFindService,
  MongoPartnerUpdateService,
} from "src/Mongo";
import {
  Partner,
  PartnerSchema,
  PartnerActivity,
  PartnerActivitySchema,
  PartnerPost,
  PartnerPostSchema,
  PartnerProduct,
  PartnerProductSchema,
} from "src/Schema";
import { MONGODB_PARTNER_CONNECTION } from "src/Constant";

@Module({
  providers: [
    MongoPartnerCreateService,
    MongoPartnerFindService,
    MongoPartnerUpdateService,
  ],
  imports: [
    MongooseModule.forFeature(
      [
        { name: Partner.name, schema: PartnerSchema },
        { name: PartnerActivity.name, schema: PartnerActivitySchema },
        { name: PartnerPost.name, schema: PartnerPostSchema },
        { name: PartnerProduct.name, schema: PartnerProductSchema },
      ],
      MONGODB_PARTNER_CONNECTION,
    ),
  ],
  exports: [
    MongoPartnerCreateService,
    MongoPartnerFindService,
    MongoPartnerUpdateService,
  ],
})
export class MongoPartnerModule {}
