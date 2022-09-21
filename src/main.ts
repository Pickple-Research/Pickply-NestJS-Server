import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { config } from "aws-sdk";
import { AppModule } from "./App";
import { CORS_ORIGINS } from "./Constant";

/**
 * 서버를 시작하는 곳입니다.
 * AppModule을 import하여 app 객체를 만들고 최종적으로 실행합니다.
 * ***
 * 주요 기능:
 * - CORS 설정
 * - 기본 Logger 설정
 * // - 모든 요청 주소에 globalPrefix 추가 ('/api')
 * //- AWS IAM 인증
 * ***
 * @author 현웅
 */
async function bootstrap() {
  //? AppModule을 import하고 app으로 만듭니다.
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    //TODO: CORS WHITE LIST 작성
    //? origin - 정의된 웹사이트에서 온 요청만을 처리합니다.
    //? credentials: true - 응답 헤더에 Access-Control-Allow-Credentials 를 추가합니다.
    origin: CORS_ORIGINS,
    credentials: true,
  });

  //? Inject하여 사용하는 Nest의 기본 Logger가 winston이 되도록 설정합니다.
  //?   기본 Logger를 어떻게 Inject하는지는 아래의 nest-winston 공식문서, 혹은 NestJS 공식문서 참조
  //? @ref app.module.ts
  //? @see https://github.com/gremo/nest-winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  /** @deprecated 하위 도메인 'api.'을 이용하므로 굳이 더 명시할 필요가 없습니다. */
  // //? 모든 요청 주소 앞단에 "/api"를 추가합니다.
  // app.setGlobalPrefix("/api");

  /** @deprecated aws.s3.service.ts 클래스가 만들어질 때 실행합니다. */
  //? AWS S3 서비스를 사용하기 위하여 IAM 인증을 진행합니다.
  //? 해당 유저는 Pickple-S3입니다. 주어진 권한은 AWS IAM 에서 확인할 수 있습니다.
  // const configService = app.get(ConfigService);
  // config.update({
  //   credentials: {
  //     accessKeyId: configService.get("AWS_ACCESS_KEY_ID"),
  //     secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY"),
  //   },
  //   region: "ap-northeast-2",
  // });

  //TODO: cluster 설정: 멀티 프로세스로 서버 운용 가능

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
