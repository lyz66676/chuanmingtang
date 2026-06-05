/**
 * 轻量级 JSON 文件数据库（开发模式）
 *
 * 用 JSON 文件持久化数据，替代需要原生编译的 better-sqlite3。
 * API 与之前的 better-sqlite3 版本完全兼容（同步调用）。
 */

import path from "path";
import fs from "fs";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

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
  password?: string;
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

interface SmsCode {
  id: number;
  phone: string;
  code: string;
  expires_at: string;
  used: number;
}

interface Store {
  orders: Record<string, Order>;
  users: Record<string, User>;
  refreshTokens: Record<string, RefreshToken>;
  addresses: Record<string, Address>;
  smsCodes: SmsCode[];
  nextSmsId: number;
}

/* ── Store ── */

let store: Store = {
  orders: {},
  users: {},
  refreshTokens: {},
  addresses: {},
  smsCodes: [],
  nextSmsId: 1,
};

function loadStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[DB] 加载失败，使用空数据:", err);
  }
}

function saveStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] 保存失败:", err);
  }
}

// 启动时加载
loadStore();

/* ── 工具函数 ── */

const now = () =>
  new Date().toISOString().replace("T", " ").slice(0, 19);

/* ── Order ── */

/** 生成订单号: DD + 日期 + 4位序号 */
export function generateOrderId(): string {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const prefix = `DD${dateStr}`;
  const existing = Object.values(store.orders).filter((o) => o.id.startsWith(prefix));
  const seq = (existing.length + 1).toString().padStart(4, "0");
  return `${prefix}${seq}`;
}

export interface OrderInput {
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type: "delivery" | "pickup";
  items: string;
  total: number;
  note?: string;
  user_id?: string;
}

export function createOrder(input: OrderInput): Order | null {
  const id = generateOrderId();
  const order: Order = {
    id,
    customer_name: input.customer_name,
    phone: input.phone,
    address: input.address || "",
    delivery_type: input.delivery_type,
    items: JSON.parse(input.items),
    total: input.total,
    status: "pending",
    note: input.note || "",
    tracking_no: "",
    pay_type: "",
    pay_status: "unpaid",
    pay_time: null,
    user_id: input.user_id || "",
    created_at: now(),
    updated_at: now(),
  };
  store.orders[id] = order;
  saveStore();
  return order;
}

export function getOrderById(id: string): Order | null {
  return store.orders[id] || null;
}

export function getOrdersByPhone(phone: string): Order[] {
  return Object.values(store.orders)
    .filter((o) => o.phone === phone)
    .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
}

export function getOrdersByUserId(userId: string): Order[] {
  return Object.values(store.orders)
    .filter((o) => o.user_id === userId)
    .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
}

export function getAllOrders(status?: string): Order[] {
  const all = Object.values(store.orders).sort((a, b) =>
    b.created_at > a.created_at ? 1 : -1
  );
  return status ? all.filter((o) => o.status === status) : all;
}

export function updateOrderStatus(id: string, status: string, extra: Record<string, unknown> = {}): Order | null {
  const order = store.orders[id];
  if (!order) return null;
  order.status = status as Order["status"];
  order.updated_at = now();
  for (const [key, val] of Object.entries(extra)) {
    (order as unknown as Record<string, unknown>)[key] = val;
  }
  saveStore();
  return order;
}

export function getOrderStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const order of Object.values(store.orders)) {
    stats[order.status] = (stats[order.status] || 0) + 1;
  }
  return stats;
}

/* ── User ── */

export function createUser(phone: string): User {
  const id = `U${Date.now()}`;
  const user: User = {
    id,
    phone,
    name: "",
    created_at: now(),
    updated_at: now(),
  };
  store.users[id] = user;
  saveStore();
  return user;
}

export function getUserByPhone(phone: string): User | null {
  return Object.values(store.users).find((u) => u.phone === phone) || null;
}

export function getUserById(id: string): User | null {
  return store.users[id] || null;
}

export function updateUserName(userId: string, name: string): User | null {
  const user = store.users[userId];
  if (!user) return null;
  user.name = name;
  user.updated_at = now();
  saveStore();
  return user;
}

/* ── Refresh Token ── */

export function createRefreshToken(userId: string, token: string, expiresAt: string): void {
  const id = `RT${Date.now()}`;
  store.refreshTokens[id] = { id, user_id: userId, token, expires_at: expiresAt, created_at: now() };
  saveStore();
}

export function getRefreshToken(token: string): RefreshToken | null {
  return Object.values(store.refreshTokens).find((t) => t.token === token) || null;
}

export function deleteRefreshToken(token: string): void {
  const entry = Object.values(store.refreshTokens).find((t) => t.token === token);
  if (entry) {
    delete store.refreshTokens[entry.id];
    saveStore();
  }
}

export function deleteExpiredRefreshTokens(): void {
  const nowStr = now();
  for (const [id, t] of Object.entries(store.refreshTokens)) {
    if (t.expires_at < nowStr) {
      delete store.refreshTokens[id];
    }
  }
  saveStore();
}

/* ── Address ── */

export function createAddress(userId: string, data: AddressInput): Address {
  const id = `A${Date.now()}`;
  if (data.is_default === 1) {
    for (const addr of Object.values(store.addresses)) {
      if (addr.user_id === userId) addr.is_default = 0;
    }
  }
  const address: Address = {
    id,
    user_id: userId,
    name: data.name,
    phone: data.phone,
    province: data.province || "",
    city: data.city || "",
    district: data.district || "",
    detail: data.detail,
    is_default: data.is_default || 0,
    created_at: now(),
  };
  store.addresses[id] = address;
  saveStore();
  return address;
}

export function getAddressesByUser(userId: string): Address[] {
  return Object.values(store.addresses)
    .filter((a) => a.user_id === userId)
    .sort((a, b) => b.is_default - a.is_default);
}

export function getAddressById(id: string): Address | null {
  return store.addresses[id] || null;
}

export function updateAddress(id: string, data: Partial<AddressInput>): Address | null {
  const addr = store.addresses[id];
  if (!addr) return null;

  if (data.is_default !== undefined) {
    if (data.is_default === 1) {
      for (const a of Object.values(store.addresses)) {
        if (a.user_id === addr.user_id && a.id !== id) a.is_default = 0;
      }
    }
    addr.is_default = data.is_default;
  }
  for (const key of ["name", "phone", "province", "city", "district", "detail"] as const) {
    if (data[key] !== undefined) (addr as unknown as Record<string, unknown>)[key] = data[key];
  }
  saveStore();
  return addr;
}

export function deleteAddress(id: string): void {
  delete store.addresses[id];
  saveStore();
}

export function setDefaultAddress(userId: string, addressId: string): Address | null {
  for (const addr of Object.values(store.addresses)) {
    if (addr.user_id === userId) addr.is_default = 0;
  }
  const addr = store.addresses[addressId];
  if (addr) {
    addr.is_default = 1;
    saveStore();
  }
  return addr || null;
}

/* ── SMS ── */

export function saveSmsCode(phone: string, code: string): void {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  store.smsCodes.push({ id: store.nextSmsId++, phone, code, expires_at: expiresAt, used: 0 });
  saveStore();
}

export function verifySmsCode(phone: string, code: string): boolean {
  const nowStr = now();
  const found = store.smsCodes.find(
    (s) => s.phone === phone && s.code === code && s.used === 0 && s.expires_at > nowStr
  );
  if (!found) return false;
  found.used = 1;
  saveStore();
  return true;
}

export function cleanExpiredSmsCodes(): void {
  const nowStr = now();
  store.smsCodes = store.smsCodes.filter((s) => s.expires_at > nowStr);
  saveStore();
}

/* ── Password ── */

export function setPassword(phone: string, password: string): boolean {
  const user = Object.values(store.users).find((u) => u.phone === phone);
  if (!user) return false;
  user.password = crypto.createHash("sha256").update(password).digest("hex");
  user.updated_at = now();
  saveStore();
  return true;
}

export function verifyPassword(phone: string, password: string): boolean {
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  const user = Object.values(store.users).find((u) => u.phone === phone && u.password === hashed);
  return !!user;
}

export function hasPassword(phone: string): boolean {
  const user = Object.values(store.users).find((u) => u.phone === phone);
  return !!user && !!user.password && user.password !== "";
}
