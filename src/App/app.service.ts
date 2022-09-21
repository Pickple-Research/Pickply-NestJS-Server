import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  async healthCheck() {
    return "(updated) Server is gracefully running";
  }
}
