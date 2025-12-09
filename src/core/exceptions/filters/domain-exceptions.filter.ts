import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { Request, Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';
import { ErrorResponseBody } from './error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки класса DomainException (instanceof DomainException)
// @Catch(DomainException)
// export class DomainHttpExceptionsFilter implements ExceptionFilter {
//   catch(exception: DomainException, host: ArgumentsHost): void {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//
//     const status = this.mapToHttpStatus(exception.code);
//     const responseBody = this.buildResponseBody(exception, request.url);
//
//     response.status(status).json(responseBody);
//   }
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.mapToHttpStatus(exception.code);

    console.log('🔴 DomainException caught:', {
      code: exception.code,
      message: exception.message,
      extensions: exception.extensions,
    });

    // ⬇️ ДЛЯ ВСЕХ DomainException возвращаем тестовый формат
    const errorsMessages = this.createErrorsMessages(exception);

    response.status(status).json({ errorsMessages });
  }

  private createErrorsMessages(exception: DomainException): Array<{message: string, field: string}> {
    const result: Array<{message: string, field: string}> = [];

    // 1. Добавляем ошибки из extensions (если есть)
    if (exception.extensions && exception.extensions.length > 0) {
      exception.extensions.forEach(ext => {
        result.push({
          message: this.cleanMessage(ext.message),
          field: ext.key
        });
      });
    }

    // 2. Если нет extensions или нужно добавить основное сообщение
    // (для ошибок валидации extensions уже содержат все ошибки,
    // для других ошибок добавляем основное сообщение)
    if (result.length === 0 && exception.message) {
      result.push({
        message: exception.message,
        field: exception.field
      });
    }

    // 3. Если все еще пусто (на всякий случай)
    if (result.length === 0) {
      result.push({
        message: 'An error occurred',
        field: 'unknown'
      });
    }

    return result;
  }

  private cleanMessage(message: string): string {
    // Убираем "; Received value: ..." если есть
    const parts = message.split(';');
    return parts[0].trim();
  }

  private getDefaultField(code: DomainExceptionCode): string {
    const fieldMap: Record<DomainExceptionCode, string> = {
      [DomainExceptionCode.BadRequest]: 'request',
      [DomainExceptionCode.Unauthorized]: 'authorization',
      [DomainExceptionCode.ValidationError]: 'validation',
      [DomainExceptionCode.Forbidden]: 'access',
      [DomainExceptionCode.NotFound]: 'resource',
      [DomainExceptionCode.ConfirmationCodeExpired]: 'code',
      [DomainExceptionCode.EmailNotConfirmed]: 'email',
      [DomainExceptionCode.PasswordRecoveryCodeExpired]: 'password',
      [DomainExceptionCode.InternalServerError]: 'server',
    };

    return fieldMap[code] || 'unknown';
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,
    requestUrl: string,
  ): ErrorResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message: exception.message,
      code: exception.code,
      extensions: exception.extensions,
    };
  }
}
