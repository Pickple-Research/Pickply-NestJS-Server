const createKeccakHash = require("keccak");
// import createKeccakHash from "keccak";

/**
 * 주어진 인자 길이만큼의 무작위 string을 생성하고 반환합니다.
 * 인자가 주어지지 않으면 32개만큼의 string을 생성합니다.
 * @see https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 * @author 현웅
 */
export const getSalt = (length: number = 32) => {
  let salt = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    salt += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return salt;
};

/**
 * 주어진 문자열을 pepper 횟수만큼 해쉬하여 반환합니다.
 * pepper 값은 .env에 있는 값을 사용해야 하며, 바뀌어선 안 됩니다.
 * @param original 원본 문자열
 * @param pepper 해쉬 반복 횟수
 * @author 현웅
 */
export const getKeccak512Hash = (original: string, pepper: number) => {
  // let hashRound = parseInt(process.env.PEPPER);
  let hashRound = pepper;

  function hash(text: string) {
    if (hashRound === 0) return text;
    hashRound -= 1;
    return hash(createKeccakHash("keccak512").update(text).digest("hex"));
  }

  return hash(original);
};
