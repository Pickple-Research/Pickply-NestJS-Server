import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * ./security.strategy.ts 파일의 EmailAuthStrategy를 사용하는 Guard입니다.
 * @author 현웅
 */
@Injectable()
export class EmailAuthGuard extends AuthGuard("email auth") {}
