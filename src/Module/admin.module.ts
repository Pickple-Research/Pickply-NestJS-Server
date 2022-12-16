import { Module } from "@nestjs/common";
import {
  // App
  AdminAppController,
  // Auth
  AdminAuthController,
  // Researchs
  AdminResearchGetController,
  AdminResearchPatchController,
  AdminResearchPostController,
  // Users
  AdminUserDeleteController,
  AdminUserGetController,
  AdminUserPatchController,
  AdminUserPostController,
  // Votes
  AdminVoteGetController,
  AdminVotePatchController,
} from "src/Controller";
import { FirebaseModule } from "src/Firebase";
import { AdminUpdateService, ResearchUpdateService } from "src/Service";
import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
  MongoNoticeModule,
} from "src/Mongo";

@Module({
  controllers: [
    // App
    AdminAppController,
    // Auth
    AdminAuthController,
    // Researchs
    AdminResearchGetController,
    AdminResearchPatchController,
    AdminResearchPostController,
    // Users
    AdminUserDeleteController,
    AdminUserGetController,
    AdminUserPatchController,
    AdminUserPostController,
    // Votes
    AdminVoteGetController,
    AdminVotePatchController,
  ],
  providers: [AdminUpdateService, ResearchUpdateService],
  imports: [
    FirebaseModule,
    AuthModule,
    UserModule,
    MongoUserModule,
    MongoResearchModule,
    MongoVoteModule,
    MongoNoticeModule,
  ],
})
export class AdminModule {}
