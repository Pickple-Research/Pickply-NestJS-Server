/**
 * 인증메일을 보낼 때 사용하는 이메일 Html 디자인입니다.
 * @author 현웅
 */
export const authCodeEmailHtml = (code) => {
  return `
      <div
        style="
          flex-direction: column;
          width: fit-content;
          padding: 18px;
          border: 1.5px solid #eeeeee;
          border-radius: 10px;
        "
      >
        <p style="font-size: 13px">안녕하세요,</p>
        <p style="font-size: 13px">픽플러님의 인증번호는 다음과 같습니다.</p>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            align-self: center;
            width: fit-content;
            background-color: #eeeeee;
            padding: 20px 25px;
            padding-right: 10px;
            margin: 28px 0px;
            margin-left: 50px;
            border-radius: 8px;
          "
        >
          <span style="font-size: 20px; font-weight: bold; letter-spacing: 15px">
            ${code}
          </span>
        </div>
        <p style="font-size: 13px">
          해당 인증번호를 회원가입 페이지 입력란에 기입해주세요
        </p>
        <p style="font-size: 13px">
          한 번 전송된 인증번호는 한 시간 이내에 인증해주셔야 합니다.
        </p>
        <p style="font-size: 13px">감사합니다 :)</p>
        <br />
        <br />
        <p style="font-size: 13px">픽플리(pickply)팀</p>
      </div>
      `;
};
