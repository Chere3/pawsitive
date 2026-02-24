import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const file = process.env.DATABASE_URL ?? './data/pawsitive.db';
const dbPath = resolve(process.cwd(), file);
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath, { create: true, strict: true });

db.exec('PRAGMA foreign_keys = ON;');

type Row = Record<string, string | number | null>;

export function run(sql: string, params?: unknown[]) {
  return params ? db.prepare(sql).run(...params) : db.prepare(sql).run();
}

export function all<T extends Row = Row>(sql: string, params?: unknown[]) {
  return params ? (db.prepare(sql).all(...params) as T[]) : (db.prepare(sql).all() as T[]);
}

export function get<T extends Row = Row>(sql: string, params?: unknown[]) {
  return params ? (db.prepare(sql).get(...params) as T | null) : (db.prepare(sql).get() as T | null);
}
