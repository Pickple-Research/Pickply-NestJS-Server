/**
 * MongoDB를 직접 조작하는 Service, 그리고 그 서비스들을 제공하는 Module들을 모두 export합니다.
 * 각 Service는 데이터 처리 방식에 따라
 * 검색(find), 생성(create), 수정(update), 삭제(delete), 검증(validate) 로 구분되어 있습니다.
 * 이 모듈을 어떻게 사용하는지는 mongo.user.module.ts 를 참고하세요.
 * @author 현웅
 */

// Feedback
export * from "./Feedback/mongo.feedback.find.service";
export * from "./Feedback/mongo.feedback.module";

// Notice
export * from "./Notice/mongo.notice.create.service";
export * from "./Notice/mongo.notice.find.service";
export * from "./Notice/mongo.notice.module";

// Parter
export * from "./Partner/mongo.partner.create.service";
export * from "./Partner/mongo.partner.find.service";
export * from "./Partner/mongo.partner.update.service";
export * from "./Partner/mongo.partner.module";

// Payment
export * from "./Payment/mongo.payment.create.service";
export * from "./Payment/mongo.payment.find.service";
export * from "./Payment/mongo.payment.update.service";
export * from "./Payment/mongo.payment.module";

// Research
export * from "./Research/mongo.research.create.service";
export * from "./Research/mongo.research.delete.service";
export * from "./Research/mongo.research.find.service";
export * from "./Research/mongo.research.standardize.service";
export * from "./Research/mongo.research.update.service";
export * from "./Research/mongo.research.validate.service";
export * from "./Research/mongo.research.module";

// User
export * from "./User/mongo.user.create.service";
export * from "./User/mongo.user.delete.service";
export * from "./User/mongo.user.find.service";
export * from "./User/mongo.user.stat.service";
export * from "./User/mongo.user.update.service";
export * from "./User/mongo.user.validate.service";
export * from "./User/mongo.user.module";

// Vote
export * from "./Vote/mongo.vote.create.service";
export * from "./Vote/mongo.vote.delete.service";
export * from "./Vote/mongo.vote.find.service";
export * from "./Vote/mongo.vote.standardize.service";
export * from "./Vote/mongo.vote.update.service";
export * from "./Vote/mongo.vote.validate.service";
export * from "./Vote/mongo.vote.module";
