import express from 'express';
import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import functions from './function.js';

router.post('/custom', async (req, res, next) => {
   try {
      const { userId } = req.users;

      let roster1 = [];
      for (let i = 0; i < playerIdArr.length; i++) {
         const roster = await prisma.players.findMany({
            where: { playerId: playerIdArr[i] },
            select: {
               playerName: true,
               speed: true,
               goalDecision: true,
               goalPower: true,
               defence: true,
               stamina: true,
               overall: true,
            },
         });
         roster1.push(roster);
      }
      let team1 = SUM(speed) * 0.1 + SUM(goalDecision) * 0.2 + SUM(goalPower) * 0.15 + SUM(defence) * 0.3 + SUM(stamina) * 0.25;

      const { opponentId } = req.params;

      let roster2 = [];
      for (let i = 0; i < playerIdArr.length; i++) {
         const roster = await prisma.players.findMany({
            where: { playerId: playerIdArr[i] },
            select: {
               playerName: true,
               speed: true,
               goalDecision: true,
               goalPower: true,
               defence: true,
               stamina: true,
               overall: true,
            },
         });
         roster2.push(roster);
      }
      let team2 = SUM(speed) * 0.1 + SUM(goalDecision) * 0.2 + SUM(goalPower) * 0.15 + SUM(defence) * 0.3 + SUM(stamina) * 0.25;

      let round = 0;
      let score1, score2 = 0;

      let diff = team1 - team2;
      let chance1 = Math.round(50 + diff);
      let chance2 = Math.round(50 - diff);

      while (round < 10) {
         if (round % 2 === 0) {
            if (chance1 > Math.random() * 100) {
               score1++;
               console.log('1Team이 득점했습니다!');
            };
         } else {
            if (chance2 > Math.random() * 100) {
               score2++;
               console.log('2Team이 득점했습니다!');
            };
         }
         console.log(`${score1} : ${score2}`);
      };

      console.log(`경기 종료\n${score1} : ${score2}`);
      if (score1 > score2) {
         return res.status(200).json({ message: '승리' });
      }
      else if (score1 < score2) {
         return res.status(200).json({ message: '패배' });
      }
      else {
         return res.status(200).json({ message: '무승부' });
      }
   } catch (err) {
      next(err);
   }
});

router.post('/rank', async (req, res, next) => {
   try {
      const { userId } = req.users;

      let roster1 = [];
      for (let i = 0; i < playerIdArr.length; i++) {
         const roster = await prisma.players.findMany({
            where: { playerId: playerIdArr[i] },
            select: {
               playerName: true,
               speed: true,
               goalDecision: true,
               goalPower: true,
               defence: true,
               stamina: true,
               overall: true,
            },
         });
         roster1.push(roster);
      }
      let team1 = SUM(speed) * 0.1 + SUM(goalDecision) * 0.2 + SUM(goalPower) * 0.15 + SUM(defence) * 0.3 + SUM(stamina) * 0.25;

      const { opponentId } = req.params;

      let roster2 = [];
      for (let i = 0; i < playerIdArr.length; i++) {
         const roster = await prisma.players.findMany({
            where: { playerId: playerIdArr[i] },
            select: {
               playerName: true,
               speed: true,
               goalDecision: true,
               goalPower: true,
               defence: true,
               stamina: true,
               overall: true,
            },
         });
         roster2.push(roster);
      }
      let team2 = SUM(speed) * 0.1 + SUM(goalDecision) * 0.2 + SUM(goalPower) * 0.15 + SUM(defence) * 0.3 + SUM(stamina) * 0.25;

      let round = 0;
      let score1, score2 = 0;

      let diff = team1 - team2;
      let chance1 = Math.round(50 + diff);
      let chance2 = Math.round(50 - diff);

      while (round < 10) {
         if (round % 2 === 0) {
            if (chance1 > Math.random() * 100) {
               score1++;
               console.log('1Team이 득점했습니다!');
            };
         } else {
            if (chance2 > Math.random() * 100) {
               score2++;
               console.log('2Team이 득점했습니다!');
            };
         }
         console.log(`${score1} : ${score2}`);
      };

      console.log(`경기 종료\n${score1} : ${score2}`);
      await prisma.$transaction(
         async (tx) => {
            if (score1 > score2) {
               await tx.users.update({
                  data: gamepoint + 25,
               })
               return res.status(200).json({ message: `승리/n현재 GP: ${gamepoint}` });
            }
            else if (score1 < score2) {
               await tx.users.update({
                  data: gamepoint - 25,
               })
               return res.status(200).json({ message: `패배/n현재 GP: ${gamepoint}` });
            }
            else {
               return res.status(200).json({ message: `무승부/n현재 GP: ${gamepoint}` });
            }
         }
      )
   } catch (err) {
      next(err);
   }
})