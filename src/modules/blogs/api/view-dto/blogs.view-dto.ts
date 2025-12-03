import { BlogDocument } from '../../domain/blog.entity';


export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt.toISOString();
    dto.isMembership = blog.isMembership;

    // dto.extendedLikesInfo = {
    //   likesCount: post.extendedLikesInfo.likesCount,
    //   dislikesCount: post.extendedLikesInfo.dislikesCount,
    //   myStatus: post.extendedLikesInfo.myStatus,
    //   newestLikes:
    // };

    return dto;
  }
}
