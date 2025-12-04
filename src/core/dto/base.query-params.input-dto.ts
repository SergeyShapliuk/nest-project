import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => {
    // Преобразуем пустую строку в значение по умолчанию
    if (value === '' || value === undefined || value === null) {
      return 1;
    }
    const num = Number(value);
    return isNaN(num) ? 1 : num;
  })
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) {
      return 10;
    }
    const num = Number(value);
    return isNaN(num) ? 10 : num;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) {
      return 'desc';
    }
    return value;
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc';

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}
