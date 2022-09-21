import {
  Controller,
  Request,
  Param,
  Headers,
  Delete,
  Inject,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { UserDeleteService } from "src/Service";
import {
  MongoUserDeleteService,
  MongoResearchDeleteService,
  MongoVoteDeleteService,
} from "src/Mongo";
import { tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
} from "src/Constant";
import { JwtUserInfo } from "src/Object/Type";
import { NotSelfRequestException } from "src/Exception";

/**
 * User 데이터에 대한 delete method 요청들을 처리하는 Controller입니다.
 * delete method 의 인자는 Header에 넣어져 전달됩니다.
 * @author 현웅
 */
@Controller("users")
export class UserDeleteController {
  constructor(
    private readonly userDeleteService: UserDeleteService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserDeleteService: MongoUserDeleteService;
  @Inject()
  private readonly mongoResearchDeleteService: MongoResearchDeleteService;
  @Inject()
  private readonly mongoVoteDeleteService: MongoVoteDeleteService;

  /**
   * !caution: 서버에서 header 데이터를 못 받습니다
   * User 데이터를 삭제합니다.
   * @author 현웅
   */
  @Delete("")
  async deleteUserById(
    @Request() req: { user: JwtUserInfo },
    @Headers("user_id") userId: string,
  ) {
    //* 다른 사람이 회원탈퇴를 요청하는 경우
    if (req.user.userId !== userId) throw new NotSelfRequestException();

    const startUserSession = this.userConnection.startSession();
    const startResearchSession = this.researchConnection.startSession();
    const startVoteSession = this.voteConnection.startSession();

    const { userSession, researchSession, voteSession } = await Promise.all([
      startUserSession,
      startResearchSession,
      startVoteSession,
    ]).then(([userSession, researchSession, voteSession]) => {
      return { userSession, researchSession, voteSession };
    });

    await tryMultiTransaction(async () => {
      const deleteUser = this.mongoUserDeleteService.deleteUserById(
        { userId },
        userSession,
      );
      const deleteResearchUser =
        this.mongoResearchDeleteService.deleteResearchUser(
          { userId },
          researchSession,
        );
      const deleteVoteUser = this.mongoVoteDeleteService.deleteVoteUser(
        { userId },
        voteSession,
      );

      await Promise.all([deleteUser, deleteResearchUser, deleteVoteUser]);
    }, [userSession, researchSession, voteSession]);
    return;
  }

  /**
   * 특정 유저의 모든 알림을 삭제합니다.
   * @author 현웅
   */
  @Delete("notifications")
  async deleteAllNotification(@Request() req: { user: JwtUserInfo }) {
    await this.mongoUserDeleteService.deleteAllNotification(req.user.userId);
  }

  /**
   * 특정 알림을 삭제합니다.
   * @author 현웅
   */
  @Delete("notifications/:notificationId")
  async deleteNotification(@Param("notificationId") notificationId: string) {
    await this.mongoUserDeleteService.deleteNotification(notificationId);
  }

  /**
   * User 데이터를 삭제합니다.
   * @author 현웅
   */
  @Delete(":userId")
  async deleteUserWithParam(
    @Request() req: { user: JwtUserInfo },
    @Param() param: { userId: string },
  ) {
    //* 다른 사람이 회원탈퇴를 요청하는 경우
    if (req.user.userId !== param.userId) throw new NotSelfRequestException();

    const startUserSession = this.userConnection.startSession();
    const startResearchSession = this.researchConnection.startSession();
    const startVoteSession = this.voteConnection.startSession();

    const { userSession, researchSession, voteSession } = await Promise.all([
      startUserSession,
      startResearchSession,
      startVoteSession,
    ]).then(([userSession, researchSession, voteSession]) => {
      return { userSession, researchSession, voteSession };
    });

    await tryMultiTransaction(async () => {
      const deleteUser = this.mongoUserDeleteService.deleteUserById(
        { userId: param.userId },
        userSession,
      );
      const deleteResearchUser =
        this.mongoResearchDeleteService.deleteResearchUser(
          { userId: param.userId },
          researchSession,
        );
      const deleteVoteUser = this.mongoVoteDeleteService.deleteVoteUser(
        { userId: param.userId },
        voteSession,
      );

      await Promise.all([deleteUser, deleteResearchUser, deleteVoteUser]);
    }, [userSession, researchSession, voteSession]);
    return;
  }
}
