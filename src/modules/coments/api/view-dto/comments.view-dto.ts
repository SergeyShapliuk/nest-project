import { Comment } from '../../domain/comment.entity';


export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
  };

  static mapToView(comment: Comment, myStatus: 'None' | 'Like' | 'Dislike' = 'None'): CommentViewDto {

    // const myStatus = await commentLikeRepository.getUserLikeStatus(
    //   comment?._id.toString() || '',
    //   userId,
    // );

    const dto = new CommentViewDto();

    dto.id = comment.id,
      dto.content = comment.content,
      dto.commentatorInfo = {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      dto.createdAt = comment.createdAt,
      dto.likesInfo = {
        likesCount: comment.likesInfo?.likesCount || 0,
        dislikesCount: comment.likesInfo?.dislikesCount || 0,
        myStatus,

      };

    return dto;
  }
}
