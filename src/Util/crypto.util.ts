// import * as crypto from "crypto";

// /**
//  * 암호화 함수
//  * 민감한 정보를 클라이언트로 전송하거나 저장할 때 사용할 예정
//  * @author 승원
//  */
// export function encrypt(data: any): String {
//   const algorithm = "aes-256-cbc";
//   const key = crypto.scryptSync(
//     process.env.JWT_SECRET,
//     process.env.TESTER_DEFAULT_PASSWORD,
//     32,
//   ); // 나만의 암호화키. password, salt, byte 순인데 password와 salt는 본인이 원하는 문구로~
//   const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음
//   const cipher = crypto.createCipheriv(algorithm, process.env.JWT_SECRET, iv); //key는 32바이트, iv는 16바이트
//   let result = cipher.update(
//     typeof data === "string" ? data : JSON.stringify(data),
//     "utf8",
//     "base64",
//   ); //data 타입이 string이어야 암호화 가능
//   result += cipher.final("base64");
//   return result;
// }

import * as CryptoJS from "crypto-js";

export function encrypt(data: any): String {

  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.JWT_SECRET).toString();


}
