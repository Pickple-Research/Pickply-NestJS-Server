/**
 * @AppSync
 * R2C 컴퍼니 관련 상수
 * @author 현웅
 */
export type CompanyConstants = {
  companyName: string;
  representative: string;
  personalInformationProtectionOfficer: string;
  address: string;
  officeNumber: string; // 사무실 유선 번호
  businessNumber: string; // 사업자 등록번호
  mailOrderSalesRegistrationNumber: string; // 통신판매번호
};

export const appCompanyConstants: CompanyConstants = {
  companyName: "(주)알투씨컴퍼니",
  representative: "김동호",
  personalInformationProtectionOfficer: "김동호",
  address: "서울특별시 서대문구 연세로2다길 11-3, 203호 (청년창업꿈터 A동)",
  officeNumber: "070 - 8095 - 1260",
  businessNumber: "479-88-02430",
  mailOrderSalesRegistrationNumber: "2022-서울서대문-2052",
};
