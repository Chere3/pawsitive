import { db } from './client.js';
import { MIGRATIONS } from './schema.js';

for (const statement of MIGRATIONS) {
  db.exec(statement);
}

console.log(`✅ Applied ${MIGRATIONS.length} database migration statements.`);
