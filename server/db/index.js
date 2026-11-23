import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostgresCmsStore } from './postgresStore.js';
import { JsonCmsStore } from './jsonStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.resolve(process.env.CMS_DATA_DIR || path.join(ROOT_DIR, 'data'));

let storeInstance = null;

export async function getCmsStore() {
  if (storeInstance) return storeInstance;

  const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';

  if (dbUrl) {
    try {
      console.log('[CMS Database] Connecting to PostgreSQL database...');
      const pgStore = new PostgresCmsStore(dbUrl);
      await pgStore.init();
      console.log('[CMS Database] Connected to PostgreSQL with migrations applied.');
      storeInstance = pgStore;
      return storeInstance;
    } catch (err) {
      console.error('[CMS Database] Failed to connect to PostgreSQL. Falling back to local JSON store:', err.message);
    }
  }

  console.log(`[CMS Database] Using Local Atomic JSON storage at: ${DATA_DIR}`);
  const jsonStore = new JsonCmsStore(DATA_DIR);
  await jsonStore.init();
  storeInstance = jsonStore;
  return storeInstance;
}

export function resetCmsStoreForTesting(mockStore) {
  storeInstance = mockStore;
}
