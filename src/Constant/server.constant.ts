import { utilities as nestWinstonModuleUtilities } from "nest-winston";
import * as winston from "winston";

/**
 * CORS 허용 주소들
 * @author 현웅
 * @add 승원
 */
export const CORS_ORIGINS = [
  // 픽플리 홈페이지 도메인
  "https://pickply.com",
  "https://pickpleresearch.com",
  "https://r2c-pickpleresearch.web.app",
  "https://r2c-pickpleresearch.firebaseapp.com",
  // 아임포트 측 도메인 (클라이언트 단에서 결제 완료 후 자동으로 아임포트가 API 를 호출함)
  "52.78.100.19",
  "52.78.48.223",
  "52.78.5.241",
];

/**
 * 복수의 DB 연결을 구별하기 위한 이름들
 * @author 현웅
 */
export const MONGODB_FEEDBACK_CONNECTION = "MONGODB_FEEDBACK_CONNECTION";
export const MONGODB_NOTICE_CONNECTION = "MONGODB_NOTICE_CONNECTION";
export const MONGODB_PARTNER_CONNECTION = "MONGODB_PARTNER_CONNECTION";
export const MONGODB_PAYMENT_CONNECTION = "MONGODB_PAYMENT_CONNECTION";
export const MONGODB_RESEARCH_CONNECTION = "MONGODB_RESEARCH_CONNECTION";
export const MONGODB_USER_CONNECTION = "MONGODB_USER_CONNETION";
export const MONGODB_VOTE_CONNECTION = "MONGODB_VOTE_CONNECTION";
/** SurBay가 사용하는 DB 연결 */
export const MONGODB_SURBAY_CONNECTION = "MONGODB_SURBAY_CONNECTION";

/**
 * EC2 인스턴스 health check 경로
 * (logging.interceptor에서 로그 생략 조건으로 사용)
 * @author 현웅
 */
export const healthCheckUrl = "/health";

/**
 * 콘솔에 남기는 winston log 형태를 지정
 * @author 현웅
 */
export const WINSTON_LOG_CONSOLE_OPTION: winston.transports.ConsoleTransportOptions =
  {
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike("Server", {
        prettyPrint: true,
      }),
    ),
  };

/**
 * 파일에 남기는 winston log 형태를 지정 (일반 로그)
 * @author 현웅
 */
export const WINSTON_COMMON_LOG_FILE_OPTION: winston.transports.FileTransportOptions =
  {
    filename: "logs/common.log", // 위치: ./logs/common.log
    level: "info", // 로그 조건: error, warn, info 레벨
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss",
      }),
      winston.format.json(),
    ),
    maxFiles: 20, // 최대 파일 갯수: 20개
    maxsize: 1024 * 1024 * 16, // 각 파일 최대 크기: 16MB
  };

/**
 * 파일에 남기는 winston log 형태를 지정 (에러 로그)
 * @author 현웅
 */
export const WINSTON_ERROR_LOG_FILE_OPTION: winston.transports.FileTransportOptions =
  {
    filename: "logs/error.log", // 위치: ./logs/error.log
    level: "error", // 로그 조건: error레벨만
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss",
      }),
      winston.format.json(),
    ),
    maxFiles: 10, // 최대 파일 갯수: 10개
    maxsize: 1024 * 1024 * 16, // 각 파일 최대 크기: 16MB
  };
