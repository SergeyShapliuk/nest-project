//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogsSortBy } from '../../../blogs/api/input-dto/blogs-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Если значение не из допустимых, используем 'createdAt' по умолчанию
    const allowedValues = Object.values(PostsSortBy as any);
    if (!value || !allowedValues.includes(value)) {
      return 'createdAt';
    }

    return value;
  })
  @IsString()
  sortBy: string = 'createdAt';
  // searchLoginTerm: string | null = null;
  // searchEmailTerm: string | null = null;
}
