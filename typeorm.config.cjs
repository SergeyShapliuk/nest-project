const { DataSource } = require('typeorm');
require('dotenv').config();


module.exports = new DataSource({
  url: process.env.POSTGRESQL_URL,
  type: 'postgres',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});

