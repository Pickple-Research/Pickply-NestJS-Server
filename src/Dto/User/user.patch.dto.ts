import { IsOptional, IsBoolean } from "class-validator";

/**
 * 알림 설정을 변경할 때 Body에 포함되어야 하는 정보들입니다.
 * @author 현웅
 */
export class UpdateUserNotificationSettingBodyDto {
  @IsOptional()
  @IsBoolean()
  appPush?: boolean;
}
