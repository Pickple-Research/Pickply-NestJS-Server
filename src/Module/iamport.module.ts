import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import {
  IamportGetController,
  IamportPatchController,
  IamportPostController,
} from "src/Controller";
import { IamportFindService } from "src/Service";
import { MongoPaymentModule } from "src/Mongo";

@Module({
  controllers: [
    IamportGetController,
    IamportPatchController,
    IamportPostController,
  ],
  providers: [IamportFindService],
  imports: [HttpModule, MongoPaymentModule],
})
export class IamportModule {}
