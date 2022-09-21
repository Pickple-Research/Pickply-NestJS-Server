# 실행환경: 우분투 20.04
FROM ubuntu:20.04

# TimeZone: 서울
ENV TZ=Asia/Seoul

# apt-get 업그레이드 && nginx 설치
# RUN apt-get update && apt-get install nginx -y

# nginx 기본 proxy 설정 파일 제거
# RUN rm /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# (github 레포지토리의) nginx-server 파일을 도커에 복사 후 심볼릭 링크 생성
# COPY nginx-server /etc/nginx/sites-available/
# RUN ln -s /etc/nginx/sites-available/nginx-server /etc/nginx/sites-enabled/nginx-server

# 참고: https://engineerworkshop.com/blog/how-to-install-a-specific-version-of-node-in-ubuntu-linux/
# npm(v16) 설치
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# yarn 설치 && yarn 버전 세팅
RUN npm install -g yarn -y && yarn set version 1.22.18

# 로그 파일 저장용 디렉토리 생성
RUN mkdir logs

# pm2 설치
# (docker와 pm2는 같이 쓰면 오히려 안 좋을 수 있음)
# RUN npm install -g pm2 -y

# server 폴더 생성
RUN mkdir /server

# (github 레포지토리의) 모든 내용을 도커 내의 /server 폴더로 복사
COPY . /server

# WORKDIR를 server로 설정
# (cd 명령어가 개별적으로 실행되기 때문에, cd server && yarn && yarn build 형태로 진행할 수 없음)
WORKDIR /server

# node modules 설치하고 build
# (일반적으로는 node modules를 .dokerignore를 통해 무시하지만 서버의 부담을 경감시키기 위해 이미지에 빌드)
RUN yarn install && yarn build

# 5000번 포트 개방(listen)
# (여러개를 여는 경우 docker-compose 단에서 바뀔 예정)
EXPOSE 5000

##################################

# 도커 이미지가 호출되었을 때 실행할 프로세스 지정.
ENTRYPOINT [ "node", "dist/main.js" ]

