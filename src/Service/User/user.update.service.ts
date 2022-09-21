import { Injectable, Inject } from "@nestjs/common";
import {
  MongoUserFindService,
  MongoUserCreateService,
  MongoUserUpdateService,
} from "src/Mongo";

@Injectable()
export class UserUpdateService {
  constructor() {}

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserCreateService: MongoUserCreateService;
  @Inject() private readonly mongoUserUpdateService: MongoUserUpdateService;
}
