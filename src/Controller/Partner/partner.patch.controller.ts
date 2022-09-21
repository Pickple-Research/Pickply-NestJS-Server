import {
  Controller,
  Inject,
  Patch,
  Request,
  Param,
  Body,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { PartnerUpdateService } from "src/Service";
import { MongoUserUpdateService, MongoPartnerUpdateService } from "src/Mongo";
import { JwtUserInfo } from "src/Object/Type";
import { tryMultiTransaction } from "src/Util";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_PARTNER_CONNECTION,
} from "src/Constant";

@Controller("partners")
export class PartnerPatchController {
  constructor(
    private readonly partnerUpdateService: PartnerUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_PARTNER_CONNECTION)
    private readonly partnerConnection: Connection,
  ) {}

  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
  @Inject()
  private readonly mongoPartnerUpdateService: MongoPartnerUpdateService;

  /**
   * @Transaction
   * 파트너를 팔로우합니다.
   * @author 현웅
   */
  @Patch("follow/:partnerId")
  async followPartner(
    @Request() req: { user: JwtUserInfo },
    @Param("partnerId") partnerId: string,
  ) {
    //* User DB, Partner DB에 대한 Session을 시작하고
    const startUserSession = this.userConnection.startSession();
    const startPartnerSession = this.partnerConnection.startSession();

    const { userSession, partnerSession } = await Promise.all([
      startUserSession,
      startPartnerSession,
    ]).then(([userSession, partnerSession]) => {
      return { userSession, partnerSession };
    });

    return await tryMultiTransaction(async () => {
      const updateUser = this.mongoUserUpdateService.followPartner(
        { userId: req.user.userId, partnerId: partnerId },
        userSession,
      );
      const updatePartner = this.mongoPartnerUpdateService.updateFollower(
        { userId: req.user.userId, partnerId },
        partnerSession,
      );
      //* Promise.all 을 이용해 두 작업을 동시에 수행합니다.
      await Promise.all([updateUser, updatePartner]);
      return;
    }, [userSession, partnerSession]);
  }

  /**
   * @Transaction
   * 파트너 팔로우를 취소합니다.
   * @author 현웅
   */
  @Patch("unfollow/:partnerId")
  async unfollowPartner(
    @Request() req: { user: JwtUserInfo },
    @Param("partnerId") partnerId: string,
  ) {
    //* User DB, Partner DB에 대한 Session을 시작하고
    const startUserSession = this.userConnection.startSession();
    const startPartnerSession = this.partnerConnection.startSession();

    const { userSession, partnerSession } = await Promise.all([
      startUserSession,
      startPartnerSession,
    ]).then(([userSession, partnerSession]) => {
      return { userSession, partnerSession };
    });

    return await tryMultiTransaction(async () => {
      const updateUser = this.mongoUserUpdateService.unfollowPartner(
        { userId: req.user.userId, partnerId },
        userSession,
      );
      const updatePartner = this.mongoPartnerUpdateService.updateUnfollower(
        { userId: req.user.userId, partnerId },
        partnerSession,
      );
      //* Promise.all 을 이용해 두 작업을 동시에 수행합니다.
      await Promise.all([updateUser, updatePartner]);
      return;
    }, [userSession, partnerSession]);
  }

  /**
   * 게시글/이벤트 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("post")
  async updatePost() {
    return await this.partnerUpdateService.updatePost();
  }

  /**
   * 제품/서비스 정보를 업데이트합니다.
   * @author 현웅
   */
  @Patch("product")
  async updateProduct() {
    return await this.partnerUpdateService.updateProduct();
  }
}
