// import { Response } from 'express';
// import { DomainError } from './domain.error';
// import { HttpStatus } from '../types/http-ststuses';
// import {RepositoryNotFoundError} from "./repository-not-found.error";
//
// export function errorsHandler(error: unknown, res: Response): void {
//   console.log('RepositoryNotFoundError',error)
//   if (error instanceof RepositoryNotFoundError) {
//
//     const httpStatus = HttpStatus.NotFound;
//
//     res.status(httpStatus).send(
//       createErrorMessages([
//         {
//           status: httpStatus,
//           detail: error.message,
//         },
//       ]),
//     );
//
//     return;
//   }
//
//   if (error instanceof DomainError) {
//     const httpStatus = HttpStatus.UnprocessableEntity;
//
//     res.status(httpStatus).send(
//       createErrorMessages([
//         {
//           status: httpStatus,
//           source: error.source,
//           detail: error.message,
//           code: error.code,
//         },
//       ]),
//     );
//
//     return;
//   }
//
//   res.sendStatus(HttpStatus.InternalServerError);
//   return;
// }
