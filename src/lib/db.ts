import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "orders.db");

/* ── Types ── */

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: "delivery" | "pickup";
  items: unknown[];
  total: number;
  status: "pending" | "paid" | "shipped" | "ready" | "completed" | "cancelled";
  note: string;
  tracking_no: string;
  pay_type: string;
  pay_status: "unpaid" | "paid";
  pay_time: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: number;
  created_at: string;
}

export interface AddressInput {
  name: string;
  phone: string;
  province?: string;
  city?: string;
  district?: string;
  detail: string;
  is_default?: number;
}

/* ── Database ── */

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone         TEXT NOT NULL,
      address       TEXT DEFAULT '',
      delivery_type TEXT NOT NULL CHECK(delivery_type IN ('delivery', 'pickup')),
      items         TEXT NOT NULL,
      total         REAL NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','ready','completed','cancelled')),
      note          TEXT DEFAULT '',
      tracking_no   TEXT DEFAULT '',
      pay_type      TEXT DEFAULT '',
      pay_status    TEXT DEFAULT 'unpaid' CHECK(pay_status IN ('unpaid','paid')),
      pay_time      DATETIME,
      user_id       TEXT DEFAULT '',
      created_at    DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at    DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      phone         TEXT UNIQUE NOT NULL,
      name          TEXT DEFAULT '',
      created_at    DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at    DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      token         TEXT UNIQUE NOT NULL,
      expires_at    DATETIME NOT NULL,
      created_at    DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      name          TEXT NOT NULL,
      phone         TEXT NOT NULL,
      province      TEXT DEFAULT '',
      city          TEXT DEFAULT '',
      district      TEXT DEFAULT '',
      detail        TEXT NOT NULL,
      is_default    INTEGER DEFAULT 0,
      created_at    DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // 兼容旧表：如果 orders 表没有 user_id 列则添加
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN user_id TEXT DEFAULT ''`);
  } catch {
    // 列已存在，忽略
  }
}

/* ── Order ID ── */

/** 生成订单号: DD + 日期 + 4位序号 */
export function generateOrderId(): string {
  const db = getDb();
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const row = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM orders WHERE id LIKE ?`
    )
    .get(`DD${dateStr}%`) as { cnt: number } | undefined;

  const seq = ((row?.cnt ?? 0) + 1).toString().padStart(4, "0");
  return `DD${dateStr}${seq}`;
}

/* ── Order CRUD ── */

export interface OrderInput {
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type: "delivery" | "pickup";
  items: string; // JSON string
  total: number;
  note?: string;
  user_id?: string;
}

export function createOrder(input: OrderInput): Order | null {
  const db = getDb();
  const id = generateOrderId();

  const stmt = db.prepare(`
    INSERT INTO orders (id, customer_name, phone, address, delivery_type, items, total, note, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.customer_name,
    input.phone,
    input.address || "",
    input.delivery_type,
    input.items,
    input.total,
    input.note || "",
    input.user_id || ""
  );

  return getOrderById(id);
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items as string),
  } as Order;
}

export function getOrdersByPhone(phone: string): Order[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC")
    .all(phone) as Record<string, unknown>[];
  return rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items as string),
  })) as Order[];
}

export function getOrdersByUserId(userId: string): Order[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Record<string, unknown>[];
  return rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items as string),
  })) as Order[];
}

export function getAllOrders(status?: string): Order[] {
  const db = getDb();
  let rows: Record<string, unknown>[];
  if (status) {
    rows = db
      .prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC")
      .all(status) as Record<string, unknown>[];
  } else {
    rows = db
      .prepare("SELECT * FROM orders ORDER BY created_at DESC")
      .all() as Record<string, unknown>[];
  }
  return rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items as string),
  })) as Order[];
}

export function updateOrderStatus(id: string, status: string, extra: Record<string, unknown> = {}): Order | null {
  const db = getDb();
  const sets = ["status = ?", "updated_at = datetime('now', 'localtime')"];
  const values: unknown[] = [status];

  for (const [key, val] of Object.entries(extra)) {
    sets.push(`${key} = ?`);
    values.push(val);
  }

  values.push(id);
  db.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  return getOrderById(id);
}

export function getOrderStats() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    )
    .all() as { status: string; count: number }[];
  const stats: Record<string, number> = {};
  for (const row of rows) {
    stats[row.status] = row.count;
  }
  return stats;
}

/* ── User CRUD ── */

export function createUser(phone: string): User {
  const db = getDb();
  const id = `U${Date.now()}`;
  db.prepare("INSERT INTO users (id, phone) VALUES (?, ?)").run(id, phone);
  return getUserById(id)!;
}

export function getUserByPhone(phone: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as Record<string, unknown> | undefined;
  if (!row) return null;
  return row as unknown as User;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return row as unknown as User;
}

export function updateUserName(userId: string, name: string): User | null {
  const db = getDb();
  db.prepare("UPDATE users SET name = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run(name, userId);
  return getUserById(userId);
}

/* ── Refresh Token CRUD ── */

export function createRefreshToken(userId: string, token: string, expiresAt: string): void {
  const db = getDb();
  const id = `RT${Date.now()}`;
  db.prepare("INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)").run(id, userId, token, expiresAt);
}

export function getRefreshToken(token: string): RefreshToken | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?").get(token) as Record<string, unknown> | undefined;
  if (!row) return null;
  return row as unknown as RefreshToken;
}

export function deleteRefreshToken(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(token);
}

export function deleteExpiredRefreshTokens(): void {
  const db = getDb();
  db.prepare("DELETE FROM refresh_tokens WHERE expires_at < datetime('now')").run();
}

/* ── Address CRUD ── */

export function createAddress(userId: string, data: AddressInput): Address {
  const db = getDb();
  const id = `A${Date.now()}`;

  // 如果设为默认，先清除其他默认地址
  if (data.is_default === 1) {
    db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
  }

  db.prepare(`
    INSERT INTO addresses (id, user_id, name, phone, province, city, district, detail, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, data.name, data.phone, data.province || "", data.city || "", data.district || "", data.detail, data.is_default || 0);

  return getAddressById(id)!;
}

export function getAddressesByUser(userId: string): Address[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC")
    .all(userId) as Record<string, unknown>[];
  return rows as unknown as Address[];
}

export function getAddressById(id: string): Address | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM addresses WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return row as unknown as Address;
}

export function updateAddress(id: string, data: Partial<AddressInput>): Address | null {
  const db = getDb();
  const existing = getAddressById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of ["name", "phone", "province", "city", "district", "detail"] as const) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (data.is_default !== undefined) {
    // 如果设为默认，先清除其他默认地址
    if (data.is_default === 1) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?").run(existing.user_id, id);
    }
    fields.push("is_default = ?");
    values.push(data.is_default);
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE addresses SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  return getAddressById(id);
}

export function deleteAddress(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM addresses WHERE id = ?").run(id);
}

export function setDefaultAddress(userId: string, addressId: string): Address | null {
  const db = getDb();
  db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
  db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?").run(addressId, userId);
  return getAddressById(addressId);
}
