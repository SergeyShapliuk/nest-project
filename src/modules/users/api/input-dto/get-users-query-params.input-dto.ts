//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { UsersSortBy } from './users-sort-by';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUsersQueryParams extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Если значение не из допустимых, используем 'createdAt' по умолчанию
    const allowedValues = Object.values(UsersSortBy as any);
    if (!value || !allowedValues.includes(value)) {
      return UsersSortBy.CreatedAt;
    }

    return value;
  })
  @IsString()
  sortBy: string = UsersSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
