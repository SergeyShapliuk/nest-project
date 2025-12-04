//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Если значение не из допустимых, используем 'createdAt' по умолчанию
    const allowedValues = Object.values(BlogsSortBy);
    if (!value || !allowedValues.includes(value)) {
      return 'createdAt';
    }

    return value;
  })
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  searchNameTerm: string | null = null;
}
