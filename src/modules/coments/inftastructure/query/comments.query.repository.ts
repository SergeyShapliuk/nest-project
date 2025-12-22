import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../../domain/comment.entity';
import { Types } from 'mongoose';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentQueryParams } from '../../api/input-dto/comment-query.input';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Comment } from '../../domain/comment.entity';
import { CommentLikeRepository } from '../comment.like.repository';

@Injectable()
export class CommentsQwRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentLikeRepository: CommentLikeRepository,
  ) {
  }

  async getByIdOrNotFoundFail(id: Types.ObjectId, userId?: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    console.log('userId', userId);
    let myStatus: 'None' | 'Like' | 'Dislike' = 'None';
    if (userId) {
      myStatus = await this.commentLikeRepository.getUserLikeStatus(comment._id.toString(), userId) || 'None';
    }
    console.log('myStatus', myStatus);
    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAll(
    queryDto: GetCommentQueryParams,
    postId: string,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {
      postId, // ✅ Добавляем postId в фильтр
      deletedAt: null, // Если у вас есть мягкое удаление
    };
    const orConditions: any[] = [];

    // if (searchLoginTerm) {
    //     filter.login = {$regex: searchLoginTerm, $options: "i"};
    // }
    //
    // if (searchEmailTerm) {
    //     filter.email = {$regex: searchEmailTerm, $options: "i"};
    //}
    console.log('getAllComments', queryDto);
    if (searchLoginTerm && searchLoginTerm.trim() !== '') {
      orConditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm && searchEmailTerm.trim() !== '') {
      orConditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    if (orConditions.length > 0) {
      filter.$and = [
        ...orConditions.map(condition => ({ ...condition })),
      ];
    }
    // const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1;

    const comments = await this.CommentModel
      .find(filter)
      // .collation({locale: "en", strength: 2})
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalCount = await this.CommentModel.countDocuments(filter);
    // Получаем myStatus для каждого комментария (асинхронно)
    const items: CommentViewDto[] = [];
    for (const comment of comments) {
      let myStatus: 'None' | 'Like' | 'Dislike' = 'None';
      if (userId) {
        myStatus = (await this.commentLikeRepository.getUserLikeStatus(comment._id.toString(), userId)) || 'None';
      }
      items.push(CommentViewDto.mapToView(comment, myStatus));
    }
    // const items = comments.map(CommentViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }
}
