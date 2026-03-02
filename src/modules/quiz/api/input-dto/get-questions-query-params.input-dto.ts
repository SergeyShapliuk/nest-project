import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { QuestionsSortBy } from './questions-sort-by';


export enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}


export class GetQuestionsQueryParams extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Если значение не из допустимых, используем 'createdAt' по умолчанию
    const allowedValues = Object.values(QuestionsSortBy as any);
    if (!value || !allowedValues.includes(value)) {
      return QuestionsSortBy.CreatedAt;
    }

    return value;
  })
  @IsString()
  sortBy: string = QuestionsSortBy.CreatedAt;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) {
      return 'all';
    }
    return value;
  })
  @IsString()
  @IsIn([PublishedStatus.All, PublishedStatus.Published, PublishedStatus.NotPublished])
  publishedStatus: PublishedStatus.All | PublishedStatus.Published | PublishedStatus.NotPublished = PublishedStatus.All as PublishedStatus;

  @IsOptional()
  @Transform(({ value }) => {
    // Преобразуем пустую строку в null
    return value?.trim() || null;
  })
  @IsString()
  bodySearchTerm: string | null = null;
}

