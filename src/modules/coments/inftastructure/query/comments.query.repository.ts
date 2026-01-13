import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentQueryParams } from '../../api/input-dto/comment-query.input';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Comment } from '../../domain/comment.entity';
import { CommentLikeRepository } from '../comment.like.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CommentsQwRepository {
  constructor(
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    private commentLikeRepository: CommentLikeRepository,
  ) {
  }

  async getByIdOrNotFoundFail(id: string, userId?: string): Promise<CommentViewDto> {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    console.log('userId', userId);
    let myStatus: 'None' | 'Like' | 'Dislike' = 'None';
    if (userId) {
      myStatus = await this.commentLikeRepository.getUserLikeStatus(comment.id, userId) || 'None';
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

    // Создаем QueryBuilder
    const qb = this.commentRepository
      .createQueryBuilder('c')
      .where('c.deletedAt IS NULL')
      .andWhere('c.postId = :postId', { postId });

    /* ========= SEARCH ========= */

    // Если нужен поиск по логину/email пользователя (через commentatorInfo)
    if (searchLoginTerm?.trim()) {
      qb.andWhere('c.commentatorInfo->>\'userLogin\' ILIKE :loginTerm', {
        loginTerm: `%${searchLoginTerm?.trim()}%`,
      });
    }

    if (searchEmailTerm?.trim()) {
      // Если email хранится в отдельном поле или в commentatorInfo
      // qb.andWhere('c.commentatorInfo->>\'email\' ILIKE :emailTerm', {
      //   emailTerm: `%${searchEmailTerm.trim()}%`,
      // });
    }

    /* ========= SORT ========= */

    // Валидация и безопасный sortBy
    const safeSortBy = this.validateSortBy(sortBy);

    // Для сортировки по вложенным полям JSON
    let sortField: string;
    switch (safeSortBy) {
      case 'userLogin':
        sortField = 'c.commentatorInfo->>\'userLogin\'';
        break;
      case 'createdAt':
        sortField = 'c.createdAt';
        break;
      default:
        sortField = `c.${safeSortBy}`;
    }

    qb.orderBy(
      sortField,
      sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );

    /* ========= PAGINATION ========= */

    const skip = (pageNumber - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    /* ========= EXECUTE ========= */

    const [comments, totalCount] = await qb.getManyAndCount();

    /* ========= PROCESS LIKES ========= */

    // Собираем ID всех комментариев для batch запроса
    const commentIds = comments.map(comment => comment.id);

    // Получаем статусы лайков для всех комментариев одним запросом
    const statusesMap = userId
      ? await this.commentLikeRepository.getLikeStatusesForComments(commentIds, userId)
      : {};

    // Маппим в DTO
    const items = comments.map(comment => {
      const myStatus = statusesMap[comment.id] || 'None';
      return CommentViewDto.mapToView(comment, myStatus);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  // Вспомогательный метод для безопасной сортировки
  private validateSortBy(sortBy: string): string {
    const allowedSortFields = [
      'id',
      'content',
      'createdAt',
      'userLogin',
      'likesCount',
      'dislikesCount',
    ];

    return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  }
}
