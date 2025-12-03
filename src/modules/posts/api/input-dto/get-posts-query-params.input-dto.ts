
//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
  // searchLoginTerm: string | null = null;
  // searchEmailTerm: string | null = null;
}
