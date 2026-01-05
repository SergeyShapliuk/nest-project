import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentCreateInputDto } from '../../../coments/api/input-dto/comment-create.input';
import { CommentViewDto } from '../../../coments/api/view-dto/comments.view-dto';
import { Comment } from '../../../coments/domain/comment.entity';
import type { CommentModelType } from '../../../coments/domain/comment.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentRepository } from '../../../coments/inftastructure/comment.repository';
import { CommentsQwRepository } from '../../../coments/inftastructure/query/comments.query.repository';
import { InjectModel } from '@nestjs/mongoose';

export class CreateCommentByPostIdCommand {
  constructor(
    public dto: CommentCreateInputDto,
    public postId: Types.ObjectId,
    public userId: Types.ObjectId | undefined) {
  }
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand, CommentViewDto> {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
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

    const entity = this.commentModel.createInstance(dto.content, commentatorInfo, postId.toString());

    // расскоментировать, чтобы увидеть, что там, где мы кидаем команду,
    // мы можем отловить ошибку, необработанную здесь
    // throw new Error('oops;');

    await this.commentRepository.save(entity);

    return this.commentsQwRepository.getByIdOrNotFoundFail(entity._id);
  }
}
