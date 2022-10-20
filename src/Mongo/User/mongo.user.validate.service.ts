import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  UnauthorizedUser,
  UnauthorizedUserDocument,
  User,
  UserDocument,
} from "src/Schema";
import {
  EmailDuplicateException,
  NicknameDuplicateException,
  EmailNotAuthorizedException,
} from "src/Exception";

@Injectable()
export class MongoUserValidateService {
  constructor(
    @InjectModel(UnauthorizedUser.name)
    private readonly UnauthorizedUser: Model<UnauthorizedUserDocument>,
    @InjectModel(User.name) private readonly User: Model<UserDocument>,
  ) {}

  /**
   * 인자로 받은 이메일로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkEmailDuplicated(email: string) {
    const user = await this.User.findOne({ email }).lean();
    if (user) throw new EmailDuplicateException();
    return;
  }

  /**
   * 인자로 받은 닉네임으로 가입된 정규 유저가 있는지 확인하고
   * 이미 존재한다면, 에러를 발생시킵니다.
   * @author 현웅
   */
  async checkNicknameDuplicated(nickname: string) {
    const user = await this.User.findOne({ nickname })
      .select({ _id: 1 })
      .lean();
    if (user) throw new NicknameDuplicateException();
    return;
  }

  /**
   * 정규유저를 만들기 전, 인자로 주어진 이메일이 인증된 상태인지 확인합니다.
   * 인증되어 있지 않은 경우 에러를 일으킵니다.
   * @author 현웅
   */
  async checkEmailAuthorized(param: {
    email: string;
    skipValidation?: boolean;
  }) {
    if (param.skipValidation === true) return;

    const user = await this.UnauthorizedUser.findOne({ email: param.email })
      .select({ authorized: 1 })
      .lean();
    if (!user || !user.authorized) throw new EmailNotAuthorizedException();
    return;
  }
}
