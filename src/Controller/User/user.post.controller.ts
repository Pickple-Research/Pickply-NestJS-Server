import { Controller, Inject, Request, Body, Post } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  EmailUnauthorizedUserSignupBodyDto,
  EmailUserSignupBodyDto,
  UserReportBodyDto,
} from "src/Dto";
import { AuthService, UserCreateService } from "src/Service";
import { GoogleService } from "src/Google";
import {
  MongoUserCreateService,
  MongoResearchCreateService,
  MongoVoteCreateService,
  MongoSurBayService,
} from "src/Mongo";
import {
  UnauthorizedUser,
  User,
  UserNotificationSetting,
  UserPrivacy,
  UserProperty,
  UserSecurity,
  CreditHistory,
} from "src/Schema";
import { Public } from "src/Security/Metadata";
import {
  tryMultiTransaction,
  getSalt,
  getCurrentISOTime,
  getDateFromInput,
  getISOTimeAfterGivenMinutes,
} from "src/Util";
import { JwtUserInfo } from "src/Object/Type";
import { AccountType, UserType, CreditHistoryType } from "src/Object/Enum";
import { NotValidBirthdayException } from "src/Exception";
import {
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  MONGODB_VOTE_CONNECTION,
  MONGODB_SURBAY_CONNECTION,
} from "src/Constant";

/**
 * 유저 계정을 만드는 Controller입니다.
 * @author 현웅
 */
@Controller("users")
export class UserPostController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly authService: AuthService,
    private readonly userCreateService: UserCreateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
    @InjectConnection(MONGODB_VOTE_CONNECTION)
    private readonly voteConnection: Connection,
    @InjectConnection(MONGODB_SURBAY_CONNECTION)
    private readonly surBayConnection: Connection,
  ) {}

  @Inject()
  private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;
  @Inject() private readonly mongoVoteCreateService: MongoVoteCreateService;
  @Inject() private readonly mongoSurBayService: MongoSurBayService;

  /**
   * 이메일을 이용하여 회원가입을 시도하는 미인증 유저 데이터를 생성합니다.
   * TODO: 생성되고 1주일 뒤 삭제되도록 동적 cronjob을 정의해야 합니다.
   * @author 현웅
   */
  @Public()
  @Post("email/unauthorized")
  async createUnauthorizedUser(
    @Body() body: EmailUnauthorizedUserSignupBodyDto,
  ) {
    const userSession = await this.userConnection.startSession();

    const authCode = (
      "00000" + Math.floor(Math.random() * 1_000_000).toString()
    ).slice(-6);

    const userInfo: UnauthorizedUser = {
      email: body.email,
      authorized: false,
      authorizationCode: authCode,
      codeExpiredAt: getISOTimeAfterGivenMinutes(60),
      createdAt: getCurrentISOTime(),
    };

    await tryMultiTransaction(async () => {
      await this.userCreateService.createUnauthorizedUser(
        { userInfo },
        userSession,
      );
    }, [userSession]);

    //* 유저 정보가 정상적으로 생성/업데이트 된 경우 인증용 메일을 발송합니다.
    await this.googleService.sendAuthCodeEmail({
      to: body.email,
      code: authCode,
    });
  }

  /**
   * 이메일 인증이 완료된 정규 유저를 생성합니다.
   * 정규 유저 생성 이후엔 ResearchUser, VoteUser 데이터도 생성합니다.
   * @author 현웅
   */
  @Public()
  @Post("email")
  async createEmailUser(@Body() body: EmailUserSignupBodyDto) {
    const salt = getSalt();
    const hashedPassword = await this.authService.getHashedPassword(
      body.password,
      salt,
    );
    const birthday = getDateFromInput({
      year: body.birthYear,
      month: body.birthMonth,
      day: body.birthDay,
    });
    const currentISOTime = getCurrentISOTime();

    if (birthday === null) throw new NotValidBirthdayException();

    const user: User = {
      userType: UserType.USER,
      accountType: AccountType.EMAIL,
      email: body.email,
      nickname: body.nickname,
      createdAt: currentISOTime,
    };
    const userNotificationSetting: UserNotificationSetting = {
      appPush: body.agreeReceiveServiceInfo,
    };
    const userPrivacy: UserPrivacy = {
      lastName: body.lastName,
      name: body.name,
    };
    const userProperty: UserProperty = {
      gender: body.gender,
      birthday: birthday.toISOString(),
    };
    const userSecurity: UserSecurity = { password: hashedPassword, salt };

    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();
    const voteSession = await this.voteConnection.startSession();

    return await tryMultiTransaction(async () => {
      //* 새로운 유저를 생성합니다.
      const newUser = await this.userCreateService.createEmailUser(
        {
          user,
          userNotificationSetting,
          userPrivacy,
          userProperty,
          userSecurity,
        },
        userSession,
      );

      //* ResearchUser, VoteUser 에 사용되는 유저 정보를 생성합니다.
      const author = {
        _id: newUser._id,
        userType: newUser.userType,
        nickname: newUser.nickname,
        grade: newUser.grade,
      };

      //* 새로 만들어진 유저 정보를 바탕으로 ResearchUser 를 생성합니다.
      const createResearchUser =
        this.mongoResearchCreateService.createResearchUser(
          { user: author },
          researchSession,
        );
      //* 새로 만들어진 유저 정보를 바탕으로 VoteUser 를 생성합니다.
      const createVoteUser = this.mongoVoteCreateService.createVoteUser(
        { user: author },
        voteSession,
      );

      //* 이 때, 회원가입 이벤트로 유입된 유저인 경우, 크레딧 사용내역을 같이 생성합니다.
      if (body.signupEvent && body.signupEventCredit) {
        //* 회원가입 이벤트로 유입된 유저인 경우, 크레딧 사용내역도 같이 생성합니다.
        const signupEventCreditHistory: CreditHistory = {
          userId: newUser._id,
          reason: body.signupEvent,
          scale: body.signupEventCredit,
          balance: body.signupEventCredit,
          type: CreditHistoryType.SIGNUP_EVENT,
          isIncome: true,
          createdAt: currentISOTime,
        };
        const createCreditHistory = this.userCreateService.createCreditHistory(
          { userId: newUser._id, creditHistory: signupEventCreditHistory },
          userSession,
        );

        await Promise.all([
          createCreditHistory,
          createResearchUser,
          createVoteUser,
        ]);
      } else {
        //* 그렇지 않은 경우에는 ResearchUser 와 VoteUser 만 생성합니다.
        await Promise.all([createResearchUser, createVoteUser]);
      }
      return;
    }, [userSession, researchSession, voteSession]);
  }

  /**
   * SurBay 유저 정보를 바탕으로 사용자를 생성합니다.
   * @author 현웅
   */
  @Public()
  @Post("email/migrate")
  async migrateSurBayUser(@Body() body: EmailUserSignupBodyDto) {
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();
    const voteSession = await this.voteConnection.startSession();
    const surBaySession = await this.surBayConnection.startSession();

    const salt = getSalt();
    const hashedPassword = await this.authService.getHashedPassword(
      body.password,
      salt,
    );
    const birthday = getDateFromInput({
      year: body.birthYear,
      month: body.birthMonth,
      day: body.birthDay,
    });

    if (birthday === null) throw new NotValidBirthdayException();

    //* 기존 회원의 포인트를 가져옵니다.
    const credit = await this.mongoSurBayService.getSurBayUserPoint(body.email);

    const user: User = {
      userType: UserType.USER,
      accountType: AccountType.EMAIL,
      email: body.email,
      nickname: body.nickname,
      createdAt: getCurrentISOTime(),
    };
    const userNotificationSetting: UserNotificationSetting = {
      appPush: body.agreeReceiveServiceInfo,
    };
    const userPrivacy: UserPrivacy = {
      lastName: body.lastName,
      name: body.name,
    };
    const userProperty: UserProperty = {
      gender: body.gender,
      birthday: birthday.toISOString(),
    };
    const userSecurity: UserSecurity = { password: hashedPassword, salt };

    return await tryMultiTransaction(async () => {
      //* 새로운 유저를 생성합니다. 이메일 검증 과정은 생략합니다.
      const newUser = await this.userCreateService.createEmailUser(
        {
          user,
          userNotificationSetting,
          userPrivacy,
          userProperty,
          userSecurity,
          skipEmailValidation: true,
        },
        userSession,
      );

      //* 기존 사용자의 point 를 creditHistory 형태로 생성합니다.
      const creditHistory: CreditHistory = {
        userId: newUser._id,
        reason: "크레딧 이관",
        type: CreditHistoryType.MIGRATE,
        scale: credit,
        isIncome: true,
        balance: credit,
        createdAt: getCurrentISOTime(),
      };

      //* ResearchUser, VoteUser 에 사용되는 유저 정보를 생성합니다.
      const author = {
        _id: newUser._id,
        userType: newUser.userType,
        nickname: newUser.nickname,
        grade: newUser.grade,
      };

      //* 기존 크레딧만큼 크레딧 변동 내역을 만들고 추가합니다.
      const migrateCredit = this.mongoUserCreateService.createCreditHistory(
        {
          userId: newUser._id,
          creditHistory,
        },
        userSession,
      );
      //* 새로 만들어진 유저 정보를 바탕으로 ResearchUser 를 생성합니다.
      const createResearchUser =
        this.mongoResearchCreateService.createResearchUser(
          { user: author },
          researchSession,
        );
      //* 새로 만들어진 유저 정보를 바탕으로 VoteUser 를 생성합니다.
      const createVoteUser = this.mongoVoteCreateService.createVoteUser(
        { user: author },
        voteSession,
      );
      //* SurBay 데이터 베이스에서 유저의 migrated 플래그를 true 로 설정합니다.
      const updateSurBayUser = this.mongoSurBayService.setSurBayUserMigrated(
        body.email,
      );

      //* 크레딧 이관, ResearchUser, VoteUser 데이터 생성, SurBay 유저 migrate 플래그 설정을 한꺼번에 실행합니다.
      await Promise.all([
        migrateCredit,
        createResearchUser,
        createVoteUser,
        updateSurBayUser,
      ]);
    }, [userSession, researchSession, voteSession, surBaySession]);
  }

  /**
   * 유저 신고 정보를 생성합니다.
   * @author 현웅
   */
  @Post("report")
  async createUserReport(
    @Request() req: { user: JwtUserInfo },
    @Body() body: UserReportBodyDto,
  ) {
    return await this.mongoUserCreateService.createUserReport({
      userReport: {
        targetUserId: body.targetUserId,
        reporterId: req.user.userId,
        reason: body.reason,
        createdAt: getCurrentISOTime(),
      },
    });
  }
}
