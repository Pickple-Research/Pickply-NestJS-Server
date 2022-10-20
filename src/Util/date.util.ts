/**
 * 현재 한국 시간을 ISO 타입으로 반환합니다.
 * @author 현웅
 */
export function getCurrentISOTime() {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // return KOREA_GMT.toISOString();
  return new Date().toISOString();
}

/**
 * 인자로 받은 날짜가 경과하였는지 반환합니다.
 * 경과한 경우 true, 그렇지 않은 경우 false 를 반환합니다.
 * @author 현웅
 */
export function didDatePassed(date: string | Date) {
  return new Date(date) < new Date();
}

/**
 * 숫자 인자를 받아 두 자리로 변환합니다.
 * @author 현웅
 */
export function digitStandizer(num: number) {
  return num < 10 ? `0${num}` : num.toString();
}

/**
 * 숫자 형태의 연, 월, 일을 인자로 받아 Date 로 변환해 반환합니다.
 * 유효한 날짜가 아닌 경우 null 을 반환합니다.
 * @author 현웅
 */
export function getDateFromInput(param: {
  year: number;
  month: number;
  day: number;
}) {
  const date = new Date(
    `${param.year.toString()}-${digitStandizer(param.month)}-${digitStandizer(
      param.day,
    )}`,
  );

  if (date instanceof Date && !isNaN(date.getTime())) return date;
  return null;
}

/**
 * 인자로 받은 분 수 만큼의 미래 한국 시간을 ISO 타입으로 반환합니다.
 * 인자가 주어지지 않으면 30분 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getISOTimeAfterGivenMinutes(minutes: number = 30) {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // KOREA_GMT.setDate(KOREA_GMT.getMinutes() + minutes);
  // return KOREA_GMT.toISOString();
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now.toISOString();
}

/**
 * 인자로 받은 일 수 만큼의 미래 한국 시간을 ISO 타입으로 반환합니다.
 * 인자가 주어지지 않으면 3일 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getISOTimeAfterGivenDays(days: number = 3) {
  // const KOREA_GMT = new Date();
  // KOREA_GMT.setHours(KOREA_GMT.getHours() + 9);
  // KOREA_GMT.setDate(KOREA_GMT.getDate() + days);
  // return KOREA_GMT.toISOString();
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

/**
 * @NotUsed
 * 날짜와 일 수를 인자로 받아,
 * 해당 날짜로부터 주어진 일 수만큼의 미래 시간을 ISO 타입으로 반환합니다.
 * 일 수 인자가 주어지지 않으면 2일 뒤의 시간을 반환합니다.
 * @author 현웅
 */
export function getFutureDateFromGivenDate(
  date: string | Date,
  days: number = 2,
) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate.toISOString();
}

/**
 * @AppSync
 * 인자로 받은 연도에 태어난 사람의 나이를 반환합니다.
 * @author 현웅
 */
export function getAge(birthday: string | Date) {
  const date = new Date(birthday);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const nowDay = now.getDate();

  let age = nowYear - year;

  if (nowMonth < month || (nowMonth === month && nowDay < day)) {
    age--;
  }

  return age;
}

/**
 * @AppSync
 * 인자로 받은 연도에 태어난 사람의 나이대를 반환합니다.
 * @author 현웅
 */
export function getAgeGroup(birthday: string | Date) {
  const age = getAge(birthday);
  switch (true) {
    case age < 20:
      return "TEEN";
    case age < 30:
      return "TWENTY";
    case age < 40:
      return "THIRTY";
    case age < 50:
      return "FOURTY";
    case age < 60:
      return "FIFTY";
    case age < 70:
      return "SIXTY";
    default:
      return "SEVENTY";
  }
}
