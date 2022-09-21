import { Controller, Get } from "@nestjs/common";
import { FeedbackFindService } from "../../Service";
import { Public } from "../../Security/Metadata";

@Controller("feedbacks")
export class FeedbackGetController {
  constructor(private readonly feedbackFindService: FeedbackFindService) {}

  /**
   * 테스트 라우터
   * @author 현웅
   */
  @Public()
  @Get("test")
  async testFeedbackRouter() {
    return await this.feedbackFindService.testFeedbackRouter();
  }
}
