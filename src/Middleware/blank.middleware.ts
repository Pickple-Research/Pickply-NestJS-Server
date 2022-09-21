import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * 가장 먼저 요청을 처리할 미들웨어를 정의합니다.
 * @author 현웅
 */
@Injectable()
export class BlankMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }
}
