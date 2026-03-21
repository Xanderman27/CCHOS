import { getDb } from './db';
import bcrypt from 'bcryptjs';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export function initUsersTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function getUserByUsername(username: string): UserRow | undefined {
  initUsersTable();
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;
}

export function getUserById(id: number): UserRow | undefined {
  initUsersTable();
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function createUser(username: string, password: string, displayName: string): UserRow {
  initUsersTable();
  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
  ).run(username, hash, displayName);
  return getUserById(result.lastInsertRowid as number)!;
}

export function verifyPassword(user: UserRow, password: string): boolean {
  return bcrypt.compareSync(password, user.password_hash);
}

export function ensureDefaultAdmin(): void {
  initUsersTable();
  const existing = getUserByUsername('admin');
  if (!existing) {
    createUser('admin', 'admin123', 'Admin');
  }
}

export function getAllUsers(): Omit<UserRow, 'password_hash'>[] {
  initUsersTable();
  const db = getDb();
  return db.prepare('SELECT id, username, display_name, created_at FROM users ORDER BY id').all() as Omit<UserRow, 'password_hash'>[];
}
