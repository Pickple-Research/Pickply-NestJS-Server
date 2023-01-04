import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import {
  IamportGetController,
  IamportPatchController,
  IamportPostController,
} from "src/Controller";
import { IamportFindService } from "src/Service";
import { MongoResearchModule, MongoPaymentModule } from "src/Mongo";
import { GoogleModule } from "src/Google";

@Module({
  controllers: [
    IamportGetController,
    IamportPatchController,
    IamportPostController,
  ],
  providers: [IamportFindService],
  imports: [HttpModule, GoogleModule, MongoResearchModule, MongoPaymentModule],
})
export class IamportModule {}
