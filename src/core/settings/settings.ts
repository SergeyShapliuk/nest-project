export const SETTINGS = {
    PORT: process.env.PORT || 5001,
    MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/mongo",
    POSTGRESQL_URL: process.env.POSTGRESQL_URL || "postgres://postgres:mysecretpassword@localhost:5432/postgres",
    DB_NAME: process.env.DB_NAME || "mongo"
};
