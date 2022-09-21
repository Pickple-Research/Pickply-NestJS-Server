import { Injectable, Inject } from "@nestjs/common";
import { MongoUserDeleteService } from "src/Mongo";

@Injectable()
export class UserDeleteService {
  constructor() {}

  @Inject() private readonly mongoUserDeleteService: MongoUserDeleteService;
}
