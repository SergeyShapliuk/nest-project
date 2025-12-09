import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';

export const ExtractUserIdFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {

    const request = context.switchToHttp().getRequest();

    const body = request.body;
    console.log('ExtractUserIdFromRequest:', {body});
    if (!body) {
      throw new Error('there is no user in the request object!');
    }

    return body;
  },
);
