import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import {
  IamportGetController,
  IamportPatchController,
  IamportPostController,
} from "src/Controller";
import { IamportFindService } from "src/Service";
import { MongoResearchModule, MongoPaymentModule } from "src/Mongo";

@Module({
  controllers: [
    IamportGetController,
    IamportPatchController,
    IamportPostController,
  ],
  providers: [IamportFindService],
  imports: [HttpModule, MongoResearchModule, MongoPaymentModule],
})
export class IamportModule {}
