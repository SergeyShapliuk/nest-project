import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentCreateInputDto } from '../../../coments/api/input-dto/comment-create.input';
import { CommentViewDto } from '../../../coments/api/view-dto/comments.view-dto';
import { Comment } from '../../../coments/domain/comment.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentRepository } from '../../../coments/inftastructure/comment.repository';
import { CommentsQwRepository } from '../../../coments/inftastructure/query/comments.query.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateCommentByPostIdCommand {
  constructor(
    public dto: CommentCreateInputDto,
    public postId: string,
    public userId: string | undefined) {
  }
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand, CommentViewDto> {
  constructor(
    private commentRepository: CommentRepository,
    private commentsQwRepository: CommentsQwRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {
  }

  async execute({ dto, postId, userId }: CreateCommentByPostIdCommand): Promise<CommentViewDto> {
    await this.postsRepository.findOrNotFoundFail(postId);


    const user = await this.usersRepository.findOrNotFoundFail(userId?.toString() || '');

    const commentatorInfo = {
      userId: userId?.toString() || 'unknown',
      userLogin: user.login,
    };

    const entityId =await this.commentRepository.create(dto.content, commentatorInfo, postId);

    // расскоментировать, чтобы увидеть, что там, где мы кидаем команду,
    // мы можем отловить ошибку, необработанную здесь
    // throw new Error('oops;');

    return this.commentsQwRepository.getByIdOrNotFoundFail(entityId);
  }
}
