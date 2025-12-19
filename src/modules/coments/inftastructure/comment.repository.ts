import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class CommentRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {
  }

  async findById(id: Types.ObjectId): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({ _id: id, deletedAt: null });
  }

  async save(newComment: CommentDocument) {
    await newComment.save();
  }

  async findByIdOrFail(id: Types.ObjectId): Promise<CommentDocument> {
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


  async create(newComment: CommentDocument): Promise<string> {
    const insertResult = await newComment.save();
    console.log({ insertResult });
    return insertResult._id.toString();
  }


  async update(id: string, newComment: { content: string }): Promise<void> {
    const updateResult = await this.CommentModel.updateOne(
      {
        _id: id,
      },
      {
        $set: newComment,
      },
    );

    if (updateResult.matchedCount < 1) {
      // throw new RepositoryNotFoundError('Comment not exist');
    }
    return;
  }

}
