import {
  Controller,
  Inject,
  UseInterceptors,
  UploadedFiles,
  Request,
  Body,
  Post,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { SlackService } from "src/Slack";
import { UserCreateService, ResearchUpdateService } from "src/Service";
import {
  Research,
  ResearchComment,
  ResearchReply,
  ResearchReplyReport,
  ResearchCommentReport,
  CreditHistory,
  Notification,
} from "src/Schema";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoResearchFindService,
  MongoResearchCreateService,
} from "src/Mongo";
import {
  getCurrentISOTime,
  getMulterOptions,
  tryMultiTransaction,
} from "src/Util";
import {
  ResearchCreateBodyDto,
  ResearchCommentCreateBodyDto,
  ResearchReplyCreateBodyDto,
  ResearchReportBodyDto,
  ResearchCommentReportBodyDto,
  ResearchReplyReportBodyDto,
  ResearchMypageBodyDto,
} from "src/Dto";
import { JwtUserInfo } from "src/Object/Type";
import { AlarmType, CreditHistoryType, UserType } from "src/Object/Enum";
import {
  CREDIT_PER_MINUTE,
  ACHEIVE_CREDIT_PER_MINUTE,
  MONGODB_USER_CONNECTION,
  MONGODB_RESEARCH_CONNECTION,
  NEW_COMMENT_ALRAM_TITLE,
  NEW_COMMENT_ALRAM_CONTENT,
  NEW_REPLY_ALRAM_TITLE,
  NEW_REPLY_ALRAM_CONTENT,
} from "src/Constant";
import { NotEnoughCreditException } from "src/Exception";

@Controller("researches")
export class ResearchPostController {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly researchUpdateService: ResearchUpdateService,

    @InjectConnection(MONGODB_USER_CONNECTION)
    private readonly userConnection: Connection,
    @InjectConnection(MONGODB_RESEARCH_CONNECTION)
    private readonly researchConnection: Connection,
  ) {}

  @Inject()
  private readonly slackService: SlackService;
  @Inject()
  private readonly mongoUserFindService: MongoUserFindService;
  @Inject()
  private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchCreateService: MongoResearchCreateService;

  /**
   * 이미지가 포함되지 않은 새로운 리서치를 생성합니다.
   * @return 생성된 리서치, CreditHistory 정보
   * @author 현웅
   */
  @Post("")
  async createResearchWithoutImages(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCreateBodyDto,
  ) {
    return await this.createResearch({
      userId: req.user.userId,
      body,
      files: {},
    });
  }

  /**
   * 이미지 파일이 포함된 새로운 리서치를 생성합니다.
   * (로직은 createResearch와 동일합니다)
   * 이미지는 S3 버킷에 업로드됩니다.
   * @return 생성된 리서치, CreditHistory 정보
   * @author 현웅
   */
  @Post("images")
  @UseInterceptors(
    //? FormData에 "thumbnail" 혹은 "images" 라는 이름의 field를 가진 데이터(파일)가 있는 경우,
    //? 해당 데이터를 가로채 각각 @UploadedFiles() 의 thumbnail과 images 인자의 값으로 넘겨줍니다.
    //? 이 때 thumbnail 필드를 가진 데이터는 하나만, images 필드를 가진 데이터는 6개까지 허용합니다.
    //? 그 외 파일에 대한 제약 조건은 researchMulterOptions를 적용합니다. aws.constant.ts 파일을 참고하세요.
    FileFieldsInterceptor(
      [
        // { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 6 },
      ],
      getMulterOptions(),
    ),
  )
  async createResearchWithImages(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCreateBodyDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return await this.createResearch({
      userId: req.user.userId,
      body,
      files,
    });
  }

  /**
   * 리서치를 업로드합니다.
   * 이미지가 포함된 경우, 포함되지 않은 경우 모두를 포괄합니다.
   * @author 현웅
   */
  async createResearch(param: {
    userId: string;
    body: ResearchCreateBodyDto;
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };
  }) {
    //* 유저가 가진 credit 을 가져옵니다
    const creditBalance = await this.mongoUserFindService.getUserCreditBalance(
      param.userId,
    );
    //* 필요한 데이터 형태를 미리 만들어둡니다.
    //* 리서치 생성에 필요한 크레딧
    const requiredCredit =
      //* 소요시간에 필요한 크레딧
      CREDIT_PER_MINUTE(param.body.estimatedTime) +
      //* 추가 리서치 지급에 필요한 크레딧
      param.body.extraCredit * param.body.extraCreditReceiverNum +
      //* 연령 스크리닝에 필요한 크레딧
      (param.body.targetAgeGroups.length !== 0 ? 5 : 0);

    //* 이 때, 유저의 크레딧이 충분한지 확인하고 충분하지 않으면 에러를 일으킵니다.
    if (creditBalance < requiredCredit) throw new NotEnoughCreditException();

    //* 현재 시간
    const currentTime = getCurrentISOTime();
    //* 새로운 리서치 정보
    const research: Research = {
      ...param.body,
      //TODO: 추후 앱단에서 수정
      //? 왜 이렇게 하나요?: 구글 폼을 이용해 리서치를 진행할 때 로그인을 요구하는 리서치인 경우 리서치 마감 감지를 못합니다. (이유는 불명)
      link: param.body.link.startsWith("https://accounts.google.com")
        ? param.body.originalLink
        : param.body.link,
      authorId: param.userId,
      credit: ACHEIVE_CREDIT_PER_MINUTE(param.body.estimatedTime),
      pulledupAt: currentTime,
      createdAt: currentTime,
      creditDistributed:
        param.body.extraCredit === 0 || param.body.extraCreditReceiverNum === 0
          ? true
          : false,
    };
    //* CreditHistory 정보
    const creditHistory: CreditHistory = {
      userId: param.userId,
      reason: param.body.title,
      type: CreditHistoryType.RESEARCH_UPLOAD,
      scale: -1 * requiredCredit,
      isIncome: false,
      balance: creditBalance - requiredCredit,
      createdAt: currentTime,
    };

    //* User DB, Research DB 세션을 시작합니다.
    const userSession = await this.userConnection.startSession();
    const researchSession = await this.researchConnection.startSession();

    const { newResearch, newCreditHistory } =
      await tryMultiTransaction(async () => {
        //* 리서치 데이터를 만듭니다
        const createNewResearch =
          this.mongoResearchCreateService.createResearch(
            { research, files: param.files },
            researchSession,
          );

        //* CreditHistory 정보를 User DB 에 반영합니다.
        const createNewCreditHistory =
          this.mongoUserCreateService.createCreditHistory(
            { userId: param.userId, creditHistory },
            userSession,
          );

        const { newResearch, newCreditHistory } = await Promise.all([
          createNewResearch,
          createNewCreditHistory,
        ]).then(([newResearch, newCreditHistory]) => {
          return { newResearch, newCreditHistory };
        });

        //TODO: 서버에서 같은 Container 를 두 개 돌리고 있기 때문에, 해당 부분이 처리되기 전까지는 일단 구동되지 않게 합니다.
        // //* 이 때, 리서치에 마감일이 설정되어 있는 경우
        // //* ScheduleRegistry 에 리서치 자동 마감 CronJob 을 등록합니다.
        // if (Boolean(newResearch.deadline)) {
        //   this.researchUpdateService.addResearchAutoCloseCronJob({
        //     researchId: newResearch._id,
        //     deadline: newResearch.deadline,
        //   });
        // }

        return { newResearch, newCreditHistory };
      }, [userSession, researchSession]);

    //* 리서치가 성공적으로 생성된 경우, Slack 운영 채널에 메세지를 보냅니다.
    //* (응답에 영향을 주지 않도록 await 을 사용하지 않습니다.)
    this.slackService.sendMessageToSlackResearchBotChannel({
      message: `새로운 리서치가 업로드 되었습니다: (${newResearch.estimatedTime}분) ${newResearch.title}`,
    });

    return { newResearch, newCreditHistory };
  }

  /**
   * @Transaction
   * 리서치 댓글을 작성합니다.
   * @return 생성된 리서치 댓글
   * @author 현웅
   */
  @Post("comments")
  async uploadResearchComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCommentCreateBodyDto,
  ) {
    const currentISOTime = getCurrentISOTime();

    const comment: ResearchComment = {
      researchId: body.researchId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: currentISOTime,
    };

    const researchSession = await this.researchConnection.startSession();

    const { updatedResearch, newComment } =
      await tryMultiTransaction(async () => {
        return await this.mongoResearchCreateService.createResearchComment(
          { comment },
          researchSession,
        );
      }, [researchSession]);

    //* 리서치 댓글 생성이 완료되면 해당 내용에 대한 알림을 생성하고 알림을 보냅니다.
    if (req.user.userId !== updatedResearch.authorId) {
      const notification: Notification = {
        userId: updatedResearch.authorId,
        type: AlarmType.NEW_COMMENT_TO_RESEARCH,
        title: NEW_COMMENT_ALRAM_TITLE,
        content: NEW_COMMENT_ALRAM_CONTENT,
        detail: updatedResearch.title,
        createdAt: currentISOTime,
        researchId: body.researchId,
      };
      this.userCreateService.makeNotification({ notification });
    }

    //* 또한 관리자가 단 댓글이 아니라면, Slack 운영 채널에 메세지를 보냅니다.
    if (req.user.userType !== UserType.ADMIN) {
      this.slackService.sendMessageToSlackResearchCommentBotChannel({
        message: `
      리서치에 새로운 댓글: ${
        body.content.length < 60
          ? body.content
          : `${body.content.slice(0, 60)}...`
      }\n리서치 _id: ${body.researchId}`,
      });
    }

    //* 최종적으로 리서치와 댓글을 반환합니다.
    return { updatedResearch, newComment };
  }

  /**
   * @Transaction
   * 리서치 대댓글을 작성합니다.
   * @return 생성된 리서치 대댓글
   * @author 현웅
   */
  @Post("replies")
  async uploadResearchReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReplyCreateBodyDto,
  ) {
    const currentISOTime = getCurrentISOTime();

    const reply: ResearchReply = {
      researchId: body.researchId,
      commentId: body.commentId,
      authorId: req.user.userId,
      content: body.content,
      createdAt: currentISOTime,
    };

    const researchSession = await this.researchConnection.startSession();

    const { updatedResearch, newReply } =
      await tryMultiTransaction(async () => {
        return await this.mongoResearchCreateService.createResearchReply(
          { reply },
          researchSession,
        );
      }, [researchSession]);

    //* 리서치 대댓글 생성이 완료되면 해당 내용에 대한 알림을 생성하고 알림을 보냅니다.
    if (req.user.userId !== body.targetUserId) {
      const notification: Notification = {
        userId: body.targetUserId,
        type: AlarmType.NEW_REPLY_TO_RESEARCH,
        title: NEW_REPLY_ALRAM_TITLE,
        content: NEW_REPLY_ALRAM_CONTENT,
        detail: updatedResearch.title,
        createdAt: currentISOTime,
        researchId: body.researchId,
      };
      this.userCreateService.makeNotification({ notification });
    }

    //* 또한 관리자가 단 대댓글이 아니라면, Slack 운영 채널에 메세지를 보냅니다.
    if (req.user.userType !== UserType.ADMIN) {
      this.slackService.sendMessageToSlackResearchCommentBotChannel({
        message: `
          리서치에 새로운 대댓글: ${
            body.content.length < 60
              ? body.content
              : `${body.content.slice(0, 60)}...`
          }\n리서치 _id: ${body.researchId}`,
      });
    }

    //* 최종적으로 리서치와 대댓글을 반환합니다.
    return { updatedResearch, newReply };
  }

  /**
   * 리서치를 신고합니다.
   * @return 리서치 신고 정보
   * @author 현웅
   */
  @Post("report")
  async reportResearch(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReportBodyDto,
  ) {
    return await this.mongoResearchCreateService.createResearchReport({
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      researchId: body.researchId,
      content: body.content,
    });
  }

  /**
   * 리서치 댓글을 신고합니다.
   * @return 리서치 댓글 신고 정보
   * @author 현웅
   */
  @Post("report/comments")
  async reportResearchComment(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchCommentReportBodyDto,
  ) {
    const researchCommentReport: ResearchCommentReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      comment: body.comment,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoResearchCreateService.createResearchCommentReport({
      researchCommentReport,
    });
  }

  /**
   * 리서치 대댓글을 신고합니다.
   * @return 리서치 대댓글 신고 정보
   * @author 현웅
   */
  @Post("report/replies")
  async reportResearchReply(
    @Request() req: { user: JwtUserInfo },
    @Body() body: ResearchReplyReportBodyDto,
  ) {
    const researchReplyReport: ResearchReplyReport = {
      userId: req.user.userId,
      userNickname: req.user.userNickname,
      reply: body.reply,
      content: body.content,
      createdAt: getCurrentISOTime(),
    };
    return await this.mongoResearchCreateService.createResearchReplyReport({
      researchReplyReport,
    });
  }

  /**
   * TODO: get 요청으로 처리하고 싶긴 한데...
   * 마이페이지 - 스크랩/참여한 리서치 목록을 더 가져옵니다.
   * @author 현웅
   */
  @Post("mypage")
  async getMypageResearches(@Body() body: ResearchMypageBodyDto) {
    return await this.mongoResearchFindService.getResearchesById(
      body.researchIds,
    );
  }
}
