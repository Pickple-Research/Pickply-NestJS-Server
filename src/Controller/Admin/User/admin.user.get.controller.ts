import { Controller, Inject, Param, Get } from "@nestjs/common";
import { Roles } from "src/Security/Metadata";
import { MongoUserFindService, MongoUserStatService } from "src/Mongo";
import { UserType } from "src/Object/Enum";
import * as crypto from "crypto";
import { Public } from "src/Security/Metadata";


/**
 * 관리자만 사용하는 유저 관련 Get 컨트롤러입니다.
 * @author 현웅
 */
@Controller("admin/users")
export class AdminUserGetController {
  constructor() { }

  @Inject() private readonly mongoUserFindService: MongoUserFindService;
  @Inject() private readonly mongoUserStatService: MongoUserStatService;

  /**
   * @author 승원
   * 회원 기본 정보 모두 가져오기
   */
  //@Roles(UserType.ADMIN)
  @Public()//추후 수정
  @Get("")
  async getUsers() {
    const users = await this.mongoUserFindService.getUsers({})

    const algorithm = 'aes-256-cbc';

    const key = crypto.scryptSync(process.env.JWT_SECRET, process.env.TESTER_DEFAULT_PASSWORD, 32); // 나만의 암호화키. password, salt, byte 순인데 password와 salt는 본인이 원하는 문구로~ 
    const iv = crypto.randomBytes(16); //초기화 벡터. 더 강력한 암호화를 위해 사용. 랜덤값이 좋음

    const cipher = crypto.createCipheriv(algorithm, key, iv); //key는 32바이트, iv는 16바이트
    //console.log(JSON.stringify(users))
    let result = cipher.update(JSON.stringify(users), 'utf8', 'base64');
    result += cipher.final('base64');
    // console.log('암호화: ', result);


    // const deciper = crypto.createDecipheriv(algorithm, key, iv);
    // let result2 = deciper.update(result, 'base64', 'utf8');
    // result2 += deciper.final('utf8');
    // console.log('복호화: ', result2);



    return result








  }

  /**
   *
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get("stat")
  async getUserStat() {
    return await this.mongoUserStatService.getStat();
  }

  /**
   * 이메일 정규식으로 유저를 검색합니다.
   * @author 현웅
   */
  @Roles(UserType.ADMIN)
  @Get(":email")
  async getUsersByEmailRegex(@Param("email") email: string) {
    if (email.length < 3) return [];
    return await this.mongoUserFindService.getUsers({
      filterQuery: { email: { $regex: email } },
      selectQuery: { email: true, nickname: true, credit: true },
    });
  }
}
