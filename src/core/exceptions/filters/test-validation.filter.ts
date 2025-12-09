// test-validation.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';

@Catch(DomainException)
export class TestValidationFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
console.log({exception})
    // Обрабатываем ТОЛЬКО ошибки валидации
    if (exception.code === DomainExceptionCode.ValidationError) {
      const errorsMessages = exception.extensions.map(ext => {
        // Убираем "Received value: ..." часть
        const message = ext.message.split(';')[0].trim();
        return {
          message,
          field: ext.key
        };
      });

      response.status(HttpStatus.BAD_REQUEST).json({ errorsMessages });
      return;
    }

    // Все другие DomainException пропускаем дальше
    throw exception;
  }
}
