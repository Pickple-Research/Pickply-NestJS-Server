import { Status400Exception, Status404Exception } from "./Status";

/**
 * 투표 삭제 시도 중 참여자가 10명 이상이 되어 삭제할 수 없는 경우 사용합니다.
 * @author 현웅
 */
export class UnableToDeleteVoteException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : "10명 이상의 사용자가 투표에 참여하여 투표를 삭제할 수 없습니다.",
    });
  }
}

/**
 * 선택한 투표 선택지 index가 유효하지 않을 때 사용합니다.
 * 기본 message: `유효하지 않은 선택지입니다`
 * @author 현웅
 */
export class SelectedOptionInvalidException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "유효하지 않은 선택지입니다",
    });
  }
}

/**
 * 유저가 투표 작성자가 아닌 경우 사용합니다.
 * 기본 message: `권한이 없습니다`
 * @author 현웅
 */
export class NotVoteAuthorException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "권한이 없습니다",
    });
  }
}

/**
 * 이미 참여한 투표에 참여를 시도하는 경우 사용합니다.
 * 기본 message: `이미 참여한 투표입니다`
 * @author 현웅
 */
export class AlreadyParticipatedVoteException extends Status400Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage ? newMessage : "이미 참여한 투표입니다",
    });
  }
}

/**
 * 투표가 존재하지 않는 경우가 에러로 처리되어야 할 때 사용합니다.
 * 기본 message: `삭제되었거나 존재하지 않는 투표입니다`
 * @author 현웅
 */
export class VoteNotFoundException extends Status404Exception {
  constructor(newMessage?: string) {
    super({
      customMessage: newMessage
        ? newMessage
        : "삭제되었거나 존재하지 않는 투표입니다",
    });
  }
}
