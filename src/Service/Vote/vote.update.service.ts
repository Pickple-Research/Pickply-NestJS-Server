import { Injectable, Inject } from "@nestjs/common";
import { ClientSession } from "mongoose";
import {
  MongoVoteCreateService,
  MongoVoteUpdateService,
  MongoVoteDeleteService,
  MongoVoteValidateService,
} from "src/Mongo";
import {
  Vote,
  VoteView,
  VoteScrap,
  VoteParticipation,
  VoteNonMemberParticipation,
} from "src/Schema";

@Injectable()
export class VoteUpdateService {
  constructor() {}

  @Inject()
  private readonly mongoVoteCreateService: MongoVoteCreateService;
  @Inject()
  private readonly mongoVoteUpdateService: MongoVoteUpdateService;
  @Inject()
  private readonly mongoVoteDeleteService: MongoVoteDeleteService;
  @Inject()
  private readonly mongoVoteValidateService: MongoVoteValidateService;

  /**
   * 투표를 조회합니다.
   * 유저가 이미 투표를 조회한 적이 있는지 확인하고 조회한 적이 없다면
   * 새로운 투표 조회 정보를 생성하고 투표 조회수를 1 증가시킵니다.
   * @return 새로 생성된 투표 조회 정보 | null
   * @author 현웅
   */
  async viewVote(param: { voteView: VoteView }) {
    if (
      await this.mongoVoteValidateService.isUserAlreadyViewedVote({
        userId: param.voteView.userId,
        voteId: param.voteView.voteId,
      })
    ) {
      return null;
    }

    await this.mongoVoteUpdateService.updateVote({
      voteId: param.voteView.voteId,
      updateQuery: { $inc: { viewsNum: 1 } },
    });

    return await this.mongoVoteCreateService.createVoteView({
      voteView: param.voteView,
    });
  }

  /**
   * 투표를 스크랩합니다.
   * 투표 스크랩 수를 증가시키고 새로운 투표 스크랩 정보를 생성합니다.
   * @return 업데이트된 투표 정보, 생성된 투표 스크랩 정보
   * @author 현웅
   */
  async scrapVote(param: { voteId: string; voteScrap: VoteScrap }) {
    //* 투표 스크랩 수 증가
    const updateVote = this.mongoVoteUpdateService.updateVote({
      voteId: param.voteId,
      updateQuery: { $inc: { scrapsNum: 1 } },
    });
    //* 투표 스크랩 정보 생성
    const createVoteScrap = this.mongoVoteCreateService.createVoteScrap({
      voteScrap: param.voteScrap,
    });
    //* 두 함수 동시 실행
    return await Promise.all([updateVote, createVoteScrap]).then(
      ([updatedVote, newVoteScrap]) => {
        return { updatedVote, newVoteScrap };
      },
    );
  }

  /**
   * 투표 스크랩을 취소합니다.
   * 투표 스크랩 수를 감소시키고 투표 스크랩 정보를 삭제합니다.
   * @return 업데이트된 투표 정보
   * @author 현웅
   */
  async unscrapVote(param: { userId: string; voteId: string }) {
    //* 투표 스크랩 수 감소
    const updateVote = this.mongoVoteUpdateService.updateVote({
      voteId: param.voteId,
      updateQuery: { $inc: { scrapsNum: -1 } },
    });
    //* 투표 스크랩 정보 삭제
    const deleteVoteScrap = this.mongoVoteDeleteService.deleteVoteScrap({
      userId: param.userId,
      voteId: param.voteId,
    });
    //* 두 함수 동시 실행
    return await Promise.all([updateVote, deleteVoteScrap]).then(
      ([updatedVote, _]) => {
        return updatedVote;
      },
    );
  }

  /**
   * (비회원) 투표에 참여합니다.
   * @return 업데이트된 투표 정보, 생성된 비회원 투표 참여 정보
   * @author 현웅
   */
  async nonMemberParticipateVote(
    param: {
      voteId: string;
      voteNonMemberParticipation: VoteNonMemberParticipation;
    },
    session: ClientSession,
  ) {
    //* 비회원 투표 결과값을 반영하는 $inc 쿼리를 동적으로 생성합니다.
    const incQuery = {};
    param.voteNonMemberParticipation.selectedOptionIndexes.forEach(
      (optionIndex) => {
        incQuery[`nonMemeberResult.${optionIndex}`] = 1;
      },
    );

    //* 선택지 index가 유효한 범위 내에 있는지 확인
    const checkIndexesValid =
      this.mongoVoteValidateService.isOptionIndexesValid(
        param.voteId,
        param.voteNonMemberParticipation.selectedOptionIndexes,
      );
    //* 비회원 투표 참여자 수 1 증가, 비회원 투표 결과값 반영
    const updateVote = this.mongoVoteUpdateService.updateVote({
      voteId: param.voteId,
      updateQuery: { $inc: { nonMemberParticipantsNum: 1, ...incQuery } },
    });
    //* 새로운 비회원 투표 참여 정보 생성 (Session 사용)
    const createVoteNonMemberParticipation =
      this.mongoVoteCreateService.createVoteNonMemberParticipation(
        { voteParticipation: param.voteNonMemberParticipation },
        session,
      );
    //* 위 세 함수를 동시에 실행
    return await Promise.all([
      checkIndexesValid,
      updateVote,
      createVoteNonMemberParticipation,
    ]).then(([_, updatedVote, newVoteNonMemberParticipation]) => {
      return { updatedVote, newVoteNonMemberParticipation };
    });
  }

  /**
   * @Transaction
   * 투표에 참여합니다.
   * 참여 정보가 유효한지 (선택지 인덱스가 유효한지) 확인하고,
   * 그렇지 않은 경우 에러를 일으킵니다.
   * @see https://stackoverflow.com/questions/21035603/mongo-node-syntax-for-inc-when-number-is-associated-with-dynamic-field-name
   * @return 참여 정보가 반영된 최신 투표 정보, 생성된 투표 참여 정보
   * @author 현웅
   */
  async participateVote(
    param: { voteId: string; voteParticipation: VoteParticipation },
    session: ClientSession,
  ) {
    //* $inc 쿼리가 동적으로 생성되어야 하므로, 쿼리문 상수를 만듭니다
    const incQuery = {};
    param.voteParticipation.selectedOptionIndexes.forEach((optionIndex) => {
      incQuery[`result.${optionIndex}`] = 1;
      incQuery[
        `analytics.${optionIndex}.${param.voteParticipation.gender}.${param.voteParticipation.ageGroup}`
      ] = 1;
    });
    //* result의 어떤 부분을 증가시킬지 설정합니다. 결과적으로 다음과 같은 쿼리를 실행시키는 것과 같은 결과를 도출합니다:
    //* { $inc: { result.n: 1, analytics.n.MALE.TWENTY: 1, result.m: 1 ... }

    //* 유저가 이미 투표에 참여했었는지 확인
    const checkAlreadyParticipated =
      this.mongoVoteValidateService.isUserAlreadyParticipatedVote({
        userId: param.voteParticipation.userId,
        voteId: param.voteId,
      });
    //* 선택지 index가 유효한 범위 내에 있는지 확인
    const checkIndexesValid =
      this.mongoVoteValidateService.isOptionIndexesValid(
        param.voteId,
        param.voteParticipation.selectedOptionIndexes,
      );
    //* 투표 참여자 수 1 증가, 투표 결과값 반영 + 마지막 참여 시간 업데이트
    const updateVote = this.mongoVoteUpdateService.updateVote({
      voteId: param.voteId,
      updateQuery: {
        $inc: { participantsNum: 1, ...incQuery },
        $set: { lastParticipatedAt: param.voteParticipation.createdAt },
      },
    });
    //* 새로운 투표 참여 정보 생성 (Session 사용)
    const createVoteParticipation =
      this.mongoVoteCreateService.createVoteParticipation(
        { voteParticipation: param.voteParticipation },
        session,
      );
    //* 위 네 함수를 동시에 실행
    return await Promise.all([
      checkAlreadyParticipated,
      checkIndexesValid,
      updateVote,
      createVoteParticipation,
    ]).then(([_, __, updatedVote, newVoteParticipation]) => {
      return { updatedVote, newVoteParticipation };
    });
  }

  /**
   * @Transaction
   * 투표를 마감합니다.
   * 이 때, 투표 마감을 요청한 유저가 투표 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 마감된 투표 정보
   * @author 현웅
   */
  async closeVote(
    param: { userId: string; voteId: string },
    session: ClientSession,
  ) {
    const checkIsAuthor = this.mongoVoteValidateService.isVoteAuthor({
      userId: param.userId,
      voteId: param.voteId,
    });
    //* 투표를 마감합니다.
    const closeVote = this.mongoVoteUpdateService.updateVote(
      { voteId: param.voteId, updateQuery: { $set: { closed: true } } },
      session,
    );

    const updatedVote = await Promise.all([checkIsAuthor, closeVote]).then(
      ([_, updatedVote]) => {
        return updatedVote;
      },
    );
    return updatedVote;
  }

  /**
   * @Transaction
   * 투표 콘텐츠를 수정합니다.
   * 이 때, 투표 수정을 요청한 유저가 투표 작성자가 아닌 경우 에러를 일으킵니다.
   * @return 수정된 투표 정보
   * @author 현웅
   */
  async editVote(
    param: { userId: string; voteId: string; vote: Partial<Vote> },
    session: ClientSession,
  ) {
    //* 투표 수정을 요청한 유저가 투표 작성자인지 확인
    const checkIsAuthor = this.mongoVoteValidateService.isVoteAuthor({
      userId: param.userId,
      voteId: param.voteId,
    });
    //* 투표 내용을 수정
    const updateVote = this.mongoVoteUpdateService.updateVote(
      { voteId: param.voteId, updateQuery: { $set: param.vote } },
      session,
    );
    //* 위 두 함수를 동시에 실행하고 수정된 투표 정보를 반환
    return await Promise.all([checkIsAuthor, updateVote]).then(
      ([_, updatedVote]) => {
        return updatedVote;
      },
    );
  }
}
