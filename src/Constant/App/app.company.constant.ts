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
  registrationNumber: string;
};

export const appCompanyConstants: CompanyConstants = {
  companyName: "(주)알투씨컴퍼니",
  representative: "김동호",
  personalInformationProtectionOfficer: "김동호",
  address: "서울특별시 서대문구 연세로2다길 11-3, 203호 (청년창업꿈터 A동)",
  registrationNumber: "479-88-02430",
};
