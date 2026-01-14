import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function startInMemoryMongo() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URL = uri;
  return uri;
}

export async function stopInMemoryMongo() {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
