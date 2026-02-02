import { Db, MongoClient } from "mongodb";
import { env } from "process";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;

  client = new MongoClient(env.MONGODB_ATLAS_URI!, {});

  await client.connect();

  console.log("✅ Connected to MongoDB");

  return client;
}

export async function getDatabase(): Promise<Db> {
  if (db) return db;

  const mongoClient = await getMongoClient();
  db = mongoClient.db(env.MONGO_DB_NAME!);

  return db;
}
