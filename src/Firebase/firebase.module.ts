import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { MongoUserModule } from "src/Mongo";

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
  imports: [MongoUserModule],
})
export class FirebaseModule {}
