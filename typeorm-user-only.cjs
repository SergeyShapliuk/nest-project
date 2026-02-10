const { DataSource } = require('typeorm');
require('dotenv').config();

module.exports = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRESQL_URL,

  // ТОЛЬКО User entity
  entities: ['src/modules/users/domain/user.entity.ts'],

  // Создайте отдельную папку для миграций
  migrations: ['migrations-user-only/*.ts'],
  migrationsTableName: 'migrations_user_only',
});
