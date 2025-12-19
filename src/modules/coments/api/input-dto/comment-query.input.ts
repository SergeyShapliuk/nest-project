import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogsSortBy } from '../../../blogs/api/input-dto/blogs-sort-by';


export class GetCommentQueryParams extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Если значение не из допустимых, используем 'createdAt' по умолчанию
    const allowedValues = Object.values(BlogsSortBy as any);
    if (!value || !allowedValues.includes(value)) {
      return BlogsSortBy.CreatedAt;
    }

    return value;
  })
  @IsString()
  sortBy: string = BlogsSortBy.CreatedAt;

  @IsOptional()
  @Transform(({ value }) => {
    // Преобразуем пустую строку в null
    return value?.trim() || null;
  })
  @IsString()
  searchLoginTerm: string | null = null;

  @IsOptional()
  @Transform(({ value }) => {
    // Преобразуем пустую строку в null
    return value?.trim() || null;
  })
  @IsString()
  searchEmailTerm: string | null = null;
}
