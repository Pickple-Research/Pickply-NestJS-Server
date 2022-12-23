/**
 * DB 에 저장될 실제 값(value)과 앱에서 표시할 이름(displayName) 으로 구성되는 Type.
 * 주로 서버와 동기화되는 상수를 정의할 때 사용합니다.
 * @author 현웅
 */
export type EnumValueWithName = {
  value: string;
  displayName: string;
};
