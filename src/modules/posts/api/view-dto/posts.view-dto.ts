import { Post } from '../../domain/post.entity';

export type LikeStatus = 'Like' | 'Dislike' | 'None';

export type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewestLike[];
  };

  static mapToView(
    post: Post,
    myStatus: LikeStatus = 'None',
    newestLikes: NewestLike[] = []
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id; // Изменено с post._id.toString() на post.id
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();

    // Получаем данные из embedded entity
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo?.likesCount || 0,
      dislikesCount: post.extendedLikesInfo?.dislikesCount || 0,
      myStatus,
      newestLikes,
    };

    return dto;
  }

  // Альтернативный метод, если extendedLikesInfo может быть undefined
  static mapToViewSafe(
    post: Post,
    myStatus: LikeStatus = 'None',
    newestLikes: NewestLike[] = []
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();

    // Проверяем наличие extendedLikesInfo
    const likesInfo = post.extendedLikesInfo || { likesCount: 0, dislikesCount: 0 };

    dto.extendedLikesInfo = {
      likesCount: likesInfo.likesCount,
      dislikesCount: likesInfo.dislikesCount,
      myStatus,
      newestLikes,
    };

    return dto;
  }
}
