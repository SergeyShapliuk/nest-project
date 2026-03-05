import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Brackets } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from '../../api/view-dto/quiz.question.view-dto';
import { GetQuestionsQueryParams, PublishedStatus } from '../../api/input-dto/get-questions-query-params.input-dto';
import { Question } from '../../domain/entities/question.entity';


@Injectable()
export class QuizQuestionQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly repo: Repository<Question>,
  ) {
  }

  async getByIdOrNotFoundFail(id: string): Promise<QuestionViewDto> {
    const question = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!question) {
      throw new NotFoundException('question not found');
    }

    return QuestionViewDto.mapToView(question);
  }

  async getAll(
    queryDto: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      bodySearchTerm,
      publishedStatus,
    } = queryDto;

    console.log({ queryDto });

    const qb = this.repo
      .createQueryBuilder('q')
      .where('q.deletedAt IS NULL');

    /* ========= FILTER BY PUBLISHED STATUS ========= */

    if (publishedStatus === PublishedStatus.Published) {
      qb.andWhere('q.published = :published', { published: true });
    } else if (publishedStatus === PublishedStatus.NotPublished) {
      qb.andWhere('q.published = :published', { published: false });
    }
    // Если All - не добавляем фильтр по published

    /* ========= SEARCH ========= */

    if (bodySearchTerm) {
      qb.andWhere(
        new Brackets(qb2 => {
          qb2.where('q.body ILIKE :bodySearchTerm', {
            bodySearchTerm: `%${bodySearchTerm.trim()}%`,
          });
          // Если нужно искать в других полях, добавляем orWhere:
          // qb2.orWhere('b.description ILIKE :searchName', {
          //   searchName: `%${searchNameTerm.trim()}%`,
          // });
        }),
      );
    }

    /* ========= SORT ========= */

    // Безопасная проверка поля для сортировки
    const safeSortBy = this.validateSortBy(sortBy);
    const safeSortDirection =
      sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Явно задаём collation для сортировки по name,
    // чтобы порядок совпадал с ожидаемым в автотестах
    // if (safeSortBy === 'body') {
    //   qb.orderBy(
    //     `q.${safeSortBy} COLLATE "C"`,
    //     safeSortDirection,
    //   );
    // } else {
    qb.orderBy(`q.${safeSortBy}`, safeSortDirection);
    // }

    /* ========= PAGINATION ========= */

    qb.skip(queryDto.calculateSkip()).take(pageSize);

    /* ========= EXECUTE ========= */
    console.log({ queryDto });
    const [questions, totalCount] = await qb.getManyAndCount();
    console.log('SQL order results:');
    questions.forEach(q => console.log(q.body, q.id, q.createdAt));
    const items = questions.map(QuestionViewDto.mapToView);


    console.log('Mapped items for test:', items.map(i => i.body));
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }

  // Вспомогательный метод для валидации поля сортировки
  private validateSortBy(sortBy: string): string {
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'body',
      'published',
      'id',
    ];

    return allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  }
}
