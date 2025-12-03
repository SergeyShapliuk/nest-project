import { PostDocument } from '../../domain/post.entity';


export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  // extendedLikesInfo: {
  //   likesCount: number;
  //   dislikesCount: number;
  //   myStatus: "Like" | "Dislike" | "None",
  //   newestLikes: Array<{
  //     addedAt: string;
  //     userId: string;
  //     login: string;
  //   }>;
  // };

  static mapToView(post: PostDocument): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();

    // dto.extendedLikesInfo = {
    //   likesCount: post.extendedLikesInfo.likesCount,
    //   dislikesCount: post.extendedLikesInfo.dislikesCount,
    //   myStatus: post.extendedLikesInfo.myStatus,
    //   newestLikes:
    // };

    return dto;
  }
}
