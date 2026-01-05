import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';
import { isUUID } from 'class-validator';

// Custom pipe example
// https://docs.nestjs.com/pipes#custom-pipes
// @Injectable()
// export class ObjectIdValidationTransformationPipe implements PipeTransform {
//   transform(value: string, metadata: ArgumentMetadata): any {
//     // Проверяем, что тип данных в декораторе — ObjectId
//     if (metadata.metatype !== Types.ObjectId) {
//       return value;
//     }
//
//     if (!isValidObjectId(value)) {
//       throw new DomainException({
//         code: DomainExceptionCode.BadRequest,
//         message: `Invalid ObjectId: ${value}`,
//       });
//     }
//     return new Types.ObjectId(value); // Преобразуем строку в ObjectId
//
//     // Если тип не ObjectId, возвращаем значение без изменений
//   }
// }

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class UUIDValidationPipe  implements PipeTransform<string> {
  transform(value: string): string {
    // Проверяем, что тип данных в декораторе — ObjectId

    if (!isUUID(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid id: ${value}`,
      });
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}
