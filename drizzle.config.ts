import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './worker/db/schema/index.ts',
  out: './drizzle/migrations',
});
