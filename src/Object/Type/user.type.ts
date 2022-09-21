/**
 * JWT 토큰에 담겨있는 정보입니다.
 * JWT Auth Guard를 통해 해석되어 Request 객체의 user에 담겨집니다.
 * @param userId 유저 _id
 * @param userNickname 유저 닉네임
 * @param userEmail 이메일 주소 (소셜 로그인의 경우 없을 수도 있음)
 * @author 현웅
 */
export type JwtUserInfo = {
  userType: string;
  userId: string;
  userNickname: string;
  userEmail?: string;
};
