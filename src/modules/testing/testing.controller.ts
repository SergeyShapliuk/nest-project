import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    // Получаем все таблицы из схемы public
    const tables = await this.dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
        AND table_type='BASE TABLE';
    `);

    // Прогоняем TRUNCATE по всем таблицам
    for (const { table_name } of tables) {
      // CASCADE нужно, чтобы удалить все связанные записи без ошибок FK
      await this.dataSource.query(`TRUNCATE TABLE "${table_name}" RESTART IDENTITY CASCADE;`);
    }

    return {
      status: 'succeeded',
    };
  }
}
