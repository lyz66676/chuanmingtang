import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "orders.db");

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
  created_at: string;
  updated_at: string;
}

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
      created_at    DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at    DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

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

export interface OrderInput {
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type: "delivery" | "pickup";
  items: string; // JSON string
  total: number;
  note?: string;
}

export function createOrder(input: OrderInput): Order | null {
  const db = getDb();
  const id = generateOrderId();

  const stmt = db.prepare(`
    INSERT INTO orders (id, customer_name, phone, address, delivery_type, items, total, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.customer_name,
    input.phone,
    input.address || "",
    input.delivery_type,
    input.items,
    input.total,
    input.note || ""
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
