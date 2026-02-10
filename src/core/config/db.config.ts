import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseConfig {
  database: Partial<TypeOrmModuleOptions>;
}

export default (): DatabaseConfig => ({
  database: {
    type: 'postgres',
    url: process.env.POSTGRESQL_URL,
    // url: url,
    autoLoadEntities: true,
    // namingStrategy: new PluralNamingStrategy(),
    logging: ['query'],
    synchronize: false,
  },
});
