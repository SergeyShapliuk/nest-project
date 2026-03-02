// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { GameStatus } from '../../domain/enums/game-status.enum';
// import { ForbiddenException } from '@nestjs/common';
//
// export class AnswerCommand {
//   constructor(
//     public readonly pairId: string,
//     public readonly userId: string,
//     public readonly questionId: string,
//     public readonly answer: string,
//   ) {}
// }
//
// @CommandHandler(AnswerCommand)
// export class AnswerHandler implements ICommandHandler<AnswerCommand> {
//   constructor(
//     @InjectRepository(GamePair)
//     private readonly pairRepo: Repository<GamePair>,
//     @InjectRepository(Answer)
//     private readonly answerRepo: Repository<Answer>,
//   ) {}
//
//   async execute(command: AnswerCommand) {
//     const { pairId, userId, questionId, answer } = command;
//
//     const pair = await this.pairRepo.findOne({
//       where: { id: pairId },
//       relations: [
//         'playersProgress',
//         'playersProgress.player',
//         'playersProgress.answers',
//         'questions',
//       ],
//     });
//
//     if (!pair || pair.status !== GameStatus.ACTIVE)
//       throw new ForbiddenException();
//
//     const progress = pair.playersProgress.find(
//       (p) => p.player.id === userId,
//     );
//     if (!progress) throw new ForbiddenException();
//
//     if (progress.answers.length >= 5)
//       throw new ForbiddenException();
//
//     const question = pair.questions.find((q) => q.id === questionId);
//     if (!question) throw new ForbiddenException();
//
//     const isCorrect = question['correctAnswer'] === answer;
//
//     await this.answerRepo.save(
//       this.answerRepo.create({
//         questionId,
//         answerStatus: isCorrect
//           ? AnswerStatus.CORRECT
//           : AnswerStatus.INCORRECT,
//         addedAt: new Date(),
//         playerProgress: progress,
//       }),
//     );
//
//     if (isCorrect) progress.score += 1;
//
//     if (pair.playersProgress.every((p) => p.answers.length === 5)) {
//       await this.finishGame(pair);
//     }
//
//     return { success: true };
//   }
//
//   private async finishGame(pair: GamePair) {
//     const [p1, p2] = pair.playersProgress;
//
//     const p1Last = Math.max(...p1.answers.map((a) => +new Date(a.addedAt)));
//     const p2Last = Math.max(...p2.answers.map((a) => +new Date(a.addedAt)));
//
//     if (p1Last < p2Last && p1.score > 0) p1.score += 1;
//     if (p2Last < p1Last && p2.score > 0) p2.score += 1;
//
//     pair.status = GameStatus.FINISHED;
//     pair.finishGameDate = new Date();
//
//     await this.pairRepo.save(pair);
//   }
// }
