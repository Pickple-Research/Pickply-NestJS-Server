import { Module } from "@nestjs/common";
import { AdminPatchController, AdminPostController } from "src/Controller";
import { FirebaseService } from "src/Firebase";
//* 빌려 쓰는 ResearchService 가 AwsS3Service 를 추가로 사용하므로 AdminModule 의 provider 에도 추가해줍니다.
import { AwsS3Service } from "src/AWS";
import { AdminUpdateService, ResearchUpdateService } from "src/Service";
import { AuthModule } from "./auth.module";
import {
  MongoUserModule,
  MongoResearchModule,
  MongoVoteModule,
} from "src/Mongo";

@Module({
  controllers: [AdminPatchController, AdminPostController],
  providers: [
    FirebaseService,
    AwsS3Service,
    AdminUpdateService,
    ResearchUpdateService,
  ],
  imports: [MongoUserModule, MongoResearchModule, MongoVoteModule, AuthModule],
})
export class AdminModule {}
