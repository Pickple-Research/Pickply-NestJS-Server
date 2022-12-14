/**
 * Controller를 모두 export 합니다.
 * auth를 제외한 각 Controller는 HTTP method 별로 구분되어 있습니다.
 * @author 현웅
 */

//Admin
export * from "./Admin/App/admin.app.controller";

export * from "./Admin/Auth/admin.auth.controller";

export * from "./Admin/Research/admin.research.get.controller";
export * from "./Admin/Research/admin.research.patch.controller";
export * from "./Admin/Research/admin.research.post.controller";

export * from "./Admin/User/admin.user.delete.controller";
export * from "./Admin/User/admin.user.get.controller";
export * from "./Admin/User/admin.user.patch.controller";
export * from "./Admin/User/admin.user.post.controller";

export * from "./Admin/Vote/admin.vote.get.controller";
export * from "./Admin/Vote/admin.vote.patch.controller";

//Auth
export * from "./Auth/auth.controller";

//Feedback
export * from "./Feedback/feedback.get.controller";

//Iamport
export * from "./Iamport/iamport.get.controller";
export * from "./Iamport/iamport.patch.controller";
export * from "./Iamport/iamport.post.controller";

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
