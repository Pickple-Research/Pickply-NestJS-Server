import { Module } from "@nestjs/common";
import { IamportPostController } from "../Controller/Iamport";
// import { } from "../Service";
// import { } from "../Mongo";

@Module({
  controllers: [IamportPostController],
  providers: [],
  imports: [],
})
export class IamportModule {}
