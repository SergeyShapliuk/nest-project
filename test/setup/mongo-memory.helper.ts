import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | null = null;

// Проверьте функцию startInMemoryMongo()
export async function startInMemoryMongo() {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
  }

  const uri = mongod.getUri();

  // Всегда обновляем env перед созданием AppModule, даже если сервер уже поднят
  process.env.MONGO_URL = uri;
  process.env.DB_NAME = process.env.DB_NAME ?? 'testdb';

  // Подключение делает Nest через MongooseModule.forRoot, здесь соединение не открываем
  return mongod;
}

export async function stopInMemoryMongo() {
  if (mongod) {
    await mongoose.disconnect();
    await mongod.stop();
    mongod = null;
  }
}
