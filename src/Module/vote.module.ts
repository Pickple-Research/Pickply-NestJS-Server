import { Module } from "@nestjs/common";
import {
  VoteGetController,
  VotePostController,
  VotePatchController,
  VoteDeleteController,
} from "src/Controller";
import {
  UserCreateService,
  UserUpdateService,
  VoteFindService,
  VoteDeleteService,
  VoteUpdateService,
} from "src/Service";
import { FirebaseModule } from "src/Firebase";
import { MongoUserModule, MongoVoteModule } from "src/Mongo";

@Module({
  controllers: [
    VoteGetController,
    VotePostController,
    VotePatchController,
    VoteDeleteController,
  ],
  providers: [
    UserCreateService,
    UserUpdateService,
    VoteFindService,
    VoteDeleteService,
    VoteUpdateService,
  ],
  imports: [FirebaseModule, MongoUserModule, MongoVoteModule],
})
export class VoteModule {}
