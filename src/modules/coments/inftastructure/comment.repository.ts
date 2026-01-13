import { Comment } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';


@Injectable()
export class CommentRepository {
  constructor(@InjectRepository(Comment) private readonly commentRepository: Repository<Comment>) {
  }

  async findById(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async save(newComment: Comment) {
    await this.commentRepository.save(newComment);
  }

  async findByIdOrFail(id: string): Promise<Comment> {
    console.log({ id });
    const res = await this.findById(id);

    if (!res) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }
    return res;
  }

  async create(
    content: string,
    commentatorInfo: {
      userId: string | 'unknown',
      userLogin: string
    }, postId: string): Promise<string> {
    const comment = Comment.createInstance(content, commentatorInfo, postId);
    const savedComment = await this.commentRepository.save(comment);
    return savedComment.id;
  }

  async update(id: string, updateData: { content: string }): Promise<Comment> {
    // Находим комментарий
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment with id ${id} not found`,
      });
    }

    // Используем метод сущности для обновления
    comment.updateComment(updateData.content);

    // Сохраняем изменения
    const updatedComment = await this.commentRepository.save(comment);

    return updatedComment;
  }

}
