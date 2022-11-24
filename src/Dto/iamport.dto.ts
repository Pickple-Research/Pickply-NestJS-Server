import { IsString, IsNumber, IsOptional } from "class-validator";

/**
 * 아임포트 결제 완료 후 정보 검증 요청시 필요한 인자입니다.
 * @author 현웅
 */
export class IamportVerifyPaymentDto {
  @IsString() // 결제에 성공한 경우 아임포트가 부여하는 고유 결제번호
  imp_uid: string;

  @IsString() // DB 에서 사용하는 고유 주문번호
  merchant_uid: string;

  @IsNumber() // 클라이언트 단에서 전송한 결제 금액
  amount: number;

  @IsString() // 결제 사유
  reason: string;

  @IsOptional()
  @IsString() // 관련 리서치 _id
  researchId?: string;
}
