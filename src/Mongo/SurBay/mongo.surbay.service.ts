import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { compareSync } from "bcrypt";
import { Model } from "mongoose";
import { SurBayUserDocument } from "src/Schema";
import {
  UserNotFoundException,
  UserAlreadyMigratedException,
  WrongPasswordException,
} from "src/Exception";

@Injectable()
export class MongoSurBayService {
  constructor(
    @InjectModel("User")
    private readonly SurBayUser: Model<SurBayUserDocument>,
  ) {}

  /**
   * SurBay 사용자 point 를 가져옵니다.
   * @author 현웅
   */
  async getSurBayUserPoint(email: string) {
    const surBayUser = await this.SurBayUser.findOne({ email })
      .select({
        points: 1,
      })
      .lean();

    if (!surBayUser) {
      throw new UserNotFoundException("등록되지 않은 계정입니다");
    }

    return surBayUser.points;
  }

  /**
   * SurBay 사용자 migrate 플래그를 true 로 설정합니다.
   * @author 현웅
   */
  async setSurBayUserMigrated(email: string) {
    await this.SurBayUser.findOneAndUpdate(
      { email },
      { $set: { migrated: true } },
    );
  }

  /**
   * SurBay 사용자의 이메일과 비밀번호를 인자로 받아
   * 해당 계정 정보를 가져옵니다. 이미 픽플리로 이관된 사용자의 경우 에러를 반환합니다.
   * @author 현웅
   */
  async surBayLogin(param: { email: string; password: string }) {
    const surBayUser = await this.SurBayUser.findOne({ email: param.email })
      .select({
        email: 1,
        userPassword: 1,
        migrated: 1,
      })
      .lean();

    if (!surBayUser) {
      throw new UserNotFoundException("등록되지 않은 계정입니다");
    }

    if (surBayUser.migrated) {
      throw new UserAlreadyMigratedException();
    }

    if (!compareSync(param.password, surBayUser.userPassword)) {
      throw new WrongPasswordException();
    }
  }
}
