import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession } from "mongoose";
import { AwsS3Service } from "src/AWS";
import { S3UploadingObject } from "src/Object/Type";
import { getCurrentISOTime, getS3UploadingObject } from "src/Util";
import {
  Research,
  ResearchDocument,
  ResearchComment,
  ResearchCommentDocument,
  ResearchCommentReport,
  ResearchCommentReportDocument,
  ResearchNonMemberParticipation,
  ResearchNonMemberParticipationDocument,
  ResearchParticipation,
  ResearchParticipationDocument,
  ResearchReply,
  ResearchReplyDocument,
  ResearchReplyReport,
  ResearchReplyReportDocument,
  ResearchReport,
  ResearchReportDocument,
  ResearchScrap,
  ResearchScrapDocument,
  ResearchUser,
  ResearchUserDocument,
  ResearchView,
  ResearchViewDocument,
} from "src/Schema";
import { BUCKET_NAME } from "src/Constant";
import { ResearchNotFoundException } from "src/Exception";

@Injectable()
export class MongoResearchCreateService {
  constructor(
    @InjectModel(Research.name)
    private readonly Research: Model<ResearchDocument>,
    @InjectModel(ResearchComment.name)
    private readonly ResearchComment: Model<ResearchCommentDocument>,
    @InjectModel(ResearchCommentReport.name)
    private readonly ResearchCommentReport: Model<ResearchCommentReportDocument>,
    @InjectModel(ResearchNonMemberParticipation.name)
    private readonly ResearchNonMemberParticipation: Model<ResearchNonMemberParticipationDocument>,
    @InjectModel(ResearchParticipation.name)
    private readonly ResearchParticipation: Model<ResearchParticipationDocument>,
    @InjectModel(ResearchReply.name)
    private readonly ResearchReply: Model<ResearchReplyDocument>,
    @InjectModel(ResearchReplyReport.name)
    private readonly ResearchReplyReport: Model<ResearchReplyReportDocument>,
    @InjectModel(ResearchReport.name)
    private readonly ResearchReport: Model<ResearchReportDocument>,
    @InjectModel(ResearchScrap.name)
    private readonly ResearchScrap: Model<ResearchScrapDocument>,
    @InjectModel(ResearchUser.name)
    private readonly ResearchUser: Model<ResearchUserDocument>,
    @InjectModel(ResearchView.name)
    private readonly ResearchView: Model<ResearchViewDocument>,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * @Transaction
   * 유저가 생성될 때, ResearchUser 정보도 함께 생성합니다.
   * 리서치 작성자, 리서치 (대)댓글 작성자 정보를 populate 해서 가져올 때 사용하게 됩니다.
   * @author 현웅
   */
  async createResearchUser(
    param: { user: ResearchUser },
    session: ClientSession,
  ) {
    await this.ResearchUser.create([param.user], { session });
    return;
  }

  /**
   * @Transaction
   * 새로운 리서치를 생성합니다. 인자로 주어진 파일이 있는 경우, S3 업로드를 시도합니다.
   * (파일 업로드가 실패하면 리서치 생성도 무효화됩니다)
   *
   * @param authorId 리서치 업로더 _id
   * @param research 리서치 정보
   * @param files 리서치와 같이 업로드할 파일
   * @param session
   *
   * @return 생성된 리서치 정보
   * @author 현웅
   */
  async createResearch(
    param: {
      research: Research;
      files: {
        // thumbnail?: Express.Multer.File[];
        images?: Express.Multer.File[];
      };
    },
    session: ClientSession,
  ) {
    //* 인자로 주어진 Session을 이용해 진행합니다.

    //* 먼저 주어진 리서치 정보에 누락된 필수정보인 author 에
    //*   authorId 값을 넣은 Research 정보를 만들고, 해당 정보로 리서치를 생성합니다.
    //* (author 는 ResearchUser 타입을 갖고 있기에,
    //*   Research 객체를 만들 때 author 에 string 타입인 authorId 를 곧바로 넣으면 에러가 납니다.)
    //* 이 행위는 session에 종속됩니다.
    const newResearches = await this.Research.create(
      [{ ...param.research, author: param.research.authorId }],
      { session },
    );

    //* 새로운 리서치 정보를 반환할 때 author 정보를 같이 주기 위해 populate 시킵니다
    const newResearch = await newResearches[0].populate({
      path: "author",
      model: this.ResearchUser,
    });

    //* 첨부된 파일들을 S3 버킷에 올릴 수 있는 형태로 변환한 후 배열에 저장합니다.
    const uploadingObjects: S3UploadingObject[] = [];

    // files.thumbnail?.forEach((thumbnail) => {
    //   uploadingObjects.push(
    //     getS3UploadingObject(BUCKET_NAME.RESEARCH, thumbnail, `thumbnail`),
    //   );
    // });

    param.files.images?.forEach((image, index) => {
      uploadingObjects.push(
        getS3UploadingObject({
          BucketName: BUCKET_NAME.RESEARCH,
          file: image,
          ACL: "public-read",
          Key: `${newResearch._id}/image${index}.jpg`,
        }),
      );
    });

    //* 첨부된 파일이 있다면, S3에 병렬적으로 업로드 해줍니다.
    //* (Promise.all()과 S3 버킷에 올릴 객체 배열의 map()을 이용합니다)
    //* 이 과정이 하나라도 실패하면 위에서 만든 리서치도 무효화됩니다.
    if (uploadingObjects.length) {
      await Promise.all(
        uploadingObjects.map((object) => {
          return this.awsS3Service.uploadObject(object);
        }),
      );
    }

    //* 이 후 새로 만들어진 리서치 정보를 반환합니다.
    return newResearch.toObject();
  }

  /**
   * 새로운 리서치 조회시: 리서치 조회 정보를 생성합니다.
   * @return 생성된 리서치 조회 정보
   * @author 현웅
   */
  async createResearchView(param: { researchView: ResearchView }) {
    const newResearchView = await this.ResearchView.create([
      param.researchView,
    ]);
    return newResearchView[0].toObject();
  }

  /**
   * 리서치 스크랩시: 리서치 스크랩 정보를 생성합니다.
   * @return 생성된 리서치 스크랩 정보
   * @author 현웅
   */
  async createResearchScrap(param: { researchScrap: ResearchScrap }) {
    const newResearchScrapes = await this.ResearchScrap.create([
      param.researchScrap,
    ]);
    return newResearchScrapes[0].toObject();
  }

  /**
   * 비회원의 리서치 참여시: 비회원 리서치 참여 정보를 생성합니다.
   * @return 생성된 비회원 리서치 참여 정보
   * @author 현웅
   */
  async createResearchNonMemberParticipation(param: {
    researchNonMemberParticipation: ResearchNonMemberParticipation;
  }) {
    const newResearchNonMemberParticipation =
      await this.ResearchNonMemberParticipation.create([
        param.researchNonMemberParticipation,
      ]);
    return newResearchNonMemberParticipation[0].toObject();
  }

  /**
   * 리서치 참여시: 리서치 참여 정보를 만듭니다.
   * @return 생성된 리서치 참여 정보
   * @author 현웅
   */
  async createResearchParticipation(
    param: {
      researchParticipation: ResearchParticipation;
    },
    session: ClientSession,
  ) {
    const newResearchParticipations = await this.ResearchParticipation.create(
      [param.researchParticipation],
      { session },
    );
    return newResearchParticipations[0].toObject();
  }

  /**
   * TODO: mongo service 가 아니라 research service 로 옮깁니다.
   * @Transaction
   * 리서치 댓글을 작성합니다.
   * @return 업데이트된 리서치 정보와 생성된 리서치 댓글
   * @author 현웅
   */
  async createResearchComment(
    param: { comment: ResearchComment },
    session?: ClientSession,
  ) {
    const updatedResearch = await this.Research.findByIdAndUpdate(
      param.comment.researchId,
      { $inc: { commentsNum: 1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
    if (!updatedResearch) throw new ResearchNotFoundException();

    const newComments = await this.ResearchComment.create([
      {
        ...param.comment,
        author: param.comment.authorId,
      },
    ]);

    const newComment = await newComments[0].populate({
      path: "author",
      model: this.ResearchUser,
    });

    return { updatedResearch, newComment: newComment.toObject() };
  }

  /**
   * TODO: mongo service 가 아니라 research service 로 옮깁니다.
   * @Transaction
   * 리서치 대댓글을 작성합니다.
   * @return 업데이트된 리서치 정보와 생성된 리서치 대댓글
   * @author 현웅
   */
  async createResearchReply(
    param: { reply: ResearchReply },
    session?: ClientSession,
  ) {
    const updatedResearch = await this.Research.findByIdAndUpdate(
      param.reply.researchId,
      { $inc: { commentsNum: 1 } },
      { returnOriginal: false },
    )
      .populate({
        path: "author",
        model: this.ResearchUser,
      })
      .lean();
    if (!updatedResearch) throw new ResearchNotFoundException();

    const newReplies = await this.ResearchReply.create([
      {
        ...param.reply,
        author: param.reply.authorId,
      },
    ]);
    await this.ResearchComment.findByIdAndUpdate(param.reply.commentId, {
      $push: { replies: newReplies[0]._id },
    });

    const newReply = await newReplies[0].populate({
      path: "author",
      model: this.ResearchUser,
    });

    return { updatedResearch, newReply: newReply.toObject() };
  }

  /**
   * 리서치 신고 정보를 생성합니다.
   * @return 리서치 신고 정보
   * @author 현웅
   */
  async createResearchReport(param: {
    userId: string;
    userNickname: string;
    researchId: string;
    content: string;
  }) {
    const research = await this.Research.findById(param.researchId)
      .select({
        title: 1,
      })
      .lean();

    const newResearchReport = await this.ResearchReport.create([
      {
        userId: param.userId,
        userNickname: param.userNickname,
        researchId: param.researchId,
        researchTitle: research.title,
        content: param.content,
        createdAt: getCurrentISOTime(),
      },
    ]);
    return newResearchReport[0].toObject();
  }

  /**
   * 리서치 댓글 신고 정보를 생성합니다.
   * @return 리서치 댓글 신고 정보
   * @author 현웅
   */
  async createResearchCommentReport(param: {
    researchCommentReport: ResearchCommentReport;
  }) {
    const newResearchCommentReport = await this.ResearchCommentReport.create([
      param.researchCommentReport,
    ]);
    return newResearchCommentReport[0].toObject();
  }

  /**
   * 리서치 대댓글 신고 정보를 생성합니다.
   * @return 리서치 대댓글 신고 정보
   * @author 현웅
   */
  async createResearchReplyReport(param: {
    researchReplyReport: ResearchReplyReport;
  }) {
    const newResearchReplyReport = await this.ResearchReplyReport.create([
      param.researchReplyReport,
    ]);
    return newResearchReplyReport[0].toObject();
  }
}
