import { PostLike } from '../../domain/post.like.entity';

export class PostLikeViewDto {
  addedAt: string;
  userId: string;
  login: string;

  static mapToView(like: PostLike): PostLikeViewDto {
    const dto = new PostLikeViewDto();

    dto.addedAt = like.createdAt.toISOString();
    dto.userId = like.userId;
    dto.login = like.login;

    return dto;
  }
}
