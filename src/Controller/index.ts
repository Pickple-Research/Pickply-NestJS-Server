/**
 * Controller를 모두 export 합니다.
 * auth를 제외한 각 Controller는 HTTP method 별로 구분되어 있습니다.
 * @author 현웅
 */

//Admin
export * from "./Admin/admin.patch.controller";
export * from "./Admin/admin.post.controller";

//Auth
export * from "./Auth/auth.controller";

//Feedback
export * from "./Feedback/feedback.get.controller";

//Notice
export * from "./Notice/notice.get.controller";
export * from "./Notice/notice.post.controller";

//Partner
export * from "./Partner/partner.get.controller";
export * from "./Partner/partner.patch.controller";
export * from "./Partner/partner.post.controller";

//Research
export * from "./Research/research.delete.controller";
export * from "./Research/research.get.controller";
export * from "./Research/research.patch.controller";
export * from "./Research/research.post.controller";

//User
export * from "./User/user.delete.controller";
export * from "./User/user.get.controller";
export * from "./User/user.patch.controller";
export * from "./User/user.post.controller";

//Vote
export * from "./Vote/vote.delete.controller";
export * from "./Vote/vote.get.controller";
export * from "./Vote/vote.patch.controller";
export * from "./Vote/vote.post.controller";
