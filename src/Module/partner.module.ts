import { Module } from "@nestjs/common";
import {
  PartnerGetController,
  PartnerPatchController,
  PartnerPostController,
} from "src/Controller";
import {
  PartnerCreateService,
  PartnerFindService,
  PartnerUpdateService,
} from "src/Service";
import { MongoUserModule, MongoPartnerModule } from "src/Mongo";

@Module({
  controllers: [
    PartnerGetController,
    PartnerPatchController,
    PartnerPostController,
  ],
  providers: [PartnerCreateService, PartnerFindService, PartnerUpdateService],
  imports: [MongoUserModule, MongoPartnerModule],
})
export class PartnerModule {}
