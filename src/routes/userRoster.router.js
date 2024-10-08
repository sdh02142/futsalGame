import express from "express";
import { prisma } from "../utils/prisma/index.js";
import { Prisma } from "@prisma/client";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 다른 유저 출전 선수 명단 검색 API
router.get("/roster", async (req, res, next) => {
  try {
    const { id } = req.body;

    // 유저 존재 유무 파악
    const getId = await prisma.users.findFirst({
      where: { id: id },
    });

    if (!getId) {
      return res
        .status(404)
        .json({ message: "해당하는 유저가 존재하지 않습니다." });
    }

    //해당 유저의 userId 가져오기
    const getUserId = await prisma.users.findFirst({
      where: { id: id },
      select: { userId: true },
    });

    // 해당 유저의 playerId 가져오기
    const getPlayerId = await prisma.rosters.findMany({
      where: { userId: +Object.values(getUserId) },
      select: { playerId: true },
    });

    // 해당하는 선수 데이터 가져오기
    let rosterArr = [];
    for (let i = 0; i < getPlayerId.length; i++) {
      const roster = await prisma.players.findMany({
        where: { playerId: +Object.values(getPlayerId[i]) },
        select: {
          playerId: true,
          playerName: true,
          speed: true,
          goalDecision: true,
          goalPower: true,
          defence: true,
          stamina: true,
          overall: true,
        },
      });
      rosterArr.push(roster);
    }
    return res.status(200).json({ data: rosterArr });
  } catch (err) {
    console.log("출전 선수 목록 불러 오던 중 오류 발생:", err);
    next(err);
  }
});

// 내 팀 출전 선수 명단 보기 API
router.get("/rosterMyTeam", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    // 해당 유저의 playerId 가져오기
    const getPlayerId = await prisma.rosters.findMany({
      where: { userId: +userId },
      select: { playerId: true },
    });

    // 해당하는 선수 데이터 가져오기
    let rosterArr = [];
    for (let i = 0; i < getPlayerId.length; i++) {
      const roster = await prisma.players.findMany({
        where: { playerId: +Object.values(getPlayerId[i]) },
        select: {
          playerId: true,
          playerName: true,
          speed: true,
          goalDecision: true,
          goalPower: true,
          defence: true,
          stamina: true,
          overall: true,
        },
      });
      rosterArr.push(roster);
    }
    return res.status(200).json({ data: rosterArr });
  } catch (err) {
    console.log("출전 선수 목록 불러 오던 중 오류 발생:", err);
    next(err);
  }
});

// 출전선수 명단에서 인벤토리 회수 API
router.post("/roster/remove", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { playerId } = req.body;

    const getPlayerId = await prisma.rosters.findMany({
      where: { userId: +userId },
      select: { playerId: true },
    });

    const getPlayerIdArr = [];

    for (let playerId of getPlayerId) {
      getPlayerIdArr.push(playerId.playerId);
    }

    // 출전선수 명단에서 해당 선수 유무 확인
    if (!getPlayerIdArr.includes(+playerId)) {
      return res.status(404).json({
        message: "해당하는 선수가 출전 선수 명단에 존재하지 않습니다.",
      });
    }

    // 삭제 할 선수 rosterId 가져오기
    const getRosterId = await prisma.rosters.findFirst({
      where: { playerId: +playerId, userId: +userId },
      select: { rosterId: true },
    });

    await prisma.$transaction(
      async tx => {
        await tx.playerInventories.create({
          data: {
            userId: +userId,
            playerId: +playerId,
          },
        });

        await tx.rosters.delete({
          where: { rosterId: +Object.values(getRosterId) },
        });
      },
      {
        // 격리수준 설정
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return res
      .status(200)
      .json({ message: "출전 선수 명단에서 제외되었습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
