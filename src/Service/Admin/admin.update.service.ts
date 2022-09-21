import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { ResearchUpdateService } from "src/Service";
import {
  MongoResearchFindService,
  MongoResearchUpdateService,
  MongoVoteUpdateService,
} from "src/Mongo";

@Injectable()
export class AdminUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoResearchFindService: MongoResearchFindService;
  @Inject()
  private readonly mongoResearchUpdateService: MongoResearchUpdateService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;

  /**
   * 리서치 댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockResearchComment() {
    return;
  }

  /**
   * 리서치 대댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockResearchReply() {
    return;
  }

  /**
   * 투표 댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockVoteComment() {
    return;
  }

  /**
   * 투표 대댓글을 블락처리합니다.
   * @author 현웅
   */
  async blockVoteReply() {
    return;
  }
}
