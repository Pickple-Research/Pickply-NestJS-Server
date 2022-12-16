import { Controller, Inject, Param, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Roles } from "src/Security/Metadata";
import {
  MongoUserDeleteService,
  MongoResearchDeleteService,
  MongoVoteDeleteService,
} from "src/Mongo";
import { UserType } from "src/Object/Enum";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
} from "src/Constant";

/**
 * 관리자만 사용하는 유저 관련 Delete 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserDeleteController {
  constructor(
    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;
  @Inject() private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  /**
   * 유저와 관련된 모든 정보를 삭제합니다.
   * (ResearchUser 와 VoteUser 는 '삭제됨' 플래그로 설정합니다.)
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Delete(":userId")
  async deleteUser(@Param("userId") userId: string) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    await this.mongoUserDeleteService.deleteUserById({ userId }, userSession);
    await this.mongoResearchDeleteService.deleteResearchUser(
      { userId },
      researchSession,
    );
    await this.mongoVoteDeleteService.deleteVoteUser({ userId }, voteSession);
  }
}
