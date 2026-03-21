import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'requests.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted','in_review','approved','fulfilled')),

      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      email TEXT NOT NULL,

      request_type TEXT NOT NULL CHECK(request_type IN ('mailing','in_person','virtual','pickup')),

      materials TEXT,
      shipping_address TEXT,
      state TEXT,
      county TEXT,
      date_needed TEXT,

      event_date TEXT,
      start_time TEXT,
      end_time TEXT,
      event_address TEXT,
      event_zip TEXT,
      indoor_outdoor TEXT,
      parking_instructions TEXT,
      target_audience TEXT,
      estimated_attendees INTEGER,
      topics TEXT,
      requestor_attending INTEGER DEFAULT 0,
      additional_notes TEXT,

      ai_priority TEXT,
      ai_tags TEXT,
      ai_fulfillment_recommendation TEXT,
      ai_notes_analysis TEXT,
      ai_geographic_eligible INTEGER,

      translation_text TEXT,
      translation_detected_language TEXT,
      translation_target_language TEXT,

      admin_notes TEXT,
      fulfillment_path TEXT,
      approved_by TEXT,
      approved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'coordinator',
      phone TEXT,
      specialties TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 50,
      unit TEXT NOT NULL DEFAULT 'units',
      notes TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe migration: add assigned_staff_id if not present
  const cols = db.prepare("PRAGMA table_info(requests)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'assigned_staff_id')) {
    db.exec('ALTER TABLE requests ADD COLUMN assigned_staff_id INTEGER');
  }
}

export interface StaffRow {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  specialties: string | null;
  active: number;
  created_at: string;
}

export function getAllStaff(): StaffRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM staff ORDER BY name').all() as StaffRow[];
}

export function getStaffById(id: number): StaffRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as StaffRow | undefined;
}

export function createStaffMember(data: { name: string; email: string; role?: string; phone?: string; specialties?: string }): StaffRow {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO staff (name, email, role, phone, specialties) VALUES (@name, @email, @role, @phone, @specialties)'
  ).run({
    name: data.name,
    email: data.email,
    role: data.role || 'coordinator',
    phone: data.phone || null,
    specialties: data.specialties || null,
  });
  return getStaffById(result.lastInsertRowid as number)!;
}

export function updateStaffMember(id: number, data: Partial<StaffRow>): StaffRow | undefined {
  const db = getDb();
  const allowedFields = ['name', 'email', 'role', 'phone', 'specialties', 'active'];
  const updates = allowedFields.filter(f => data[f as keyof StaffRow] !== undefined);
  if (updates.length === 0) return getStaffById(id);

  const setClause = updates.map(f => `${f} = @${f}`).join(', ');
  const params: Record<string, unknown> = { id };
  for (const f of updates) {
    params[f] = data[f as keyof StaffRow] ?? null;
  }

  db.prepare(`UPDATE staff SET ${setClause} WHERE id = @id`).run(params);
  return getStaffById(id);
}

export function deleteStaffMember(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM staff WHERE id = ?').run(id);
  return result.changes > 0;
}

export interface RequestRow {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  name: string;
  organization: string;
  email: string;
  request_type: string;
  materials: string | null;
  shipping_address: string | null;
  state: string | null;
  county: string | null;
  date_needed: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  event_address: string | null;
  event_zip: string | null;
  indoor_outdoor: string | null;
  parking_instructions: string | null;
  target_audience: string | null;
  estimated_attendees: number | null;
  topics: string | null;
  requestor_attending: number;
  additional_notes: string | null;
  ai_priority: string | null;
  ai_tags: string | null;
  ai_fulfillment_recommendation: string | null;
  ai_notes_analysis: string | null;
  ai_geographic_eligible: number | null;
  translation_text: string | null;
  translation_detected_language: string | null;
  translation_target_language: string | null;
  admin_notes: string | null;
  fulfillment_path: string | null;
  approved_by: string | null;
  approved_at: string | null;
  assigned_staff_id: number | null;
}

export function getAllRequests(filters?: {
  status?: string;
  request_type?: string;
  search?: string;
}): RequestRow[] {
  const db = getDb();
  let sql = 'SELECT * FROM requests WHERE 1=1';
  const params: Record<string, string> = {};

  if (filters?.status) {
    sql += ' AND status = @status';
    params.status = filters.status;
  }
  if (filters?.request_type) {
    sql += ' AND request_type = @request_type';
    params.request_type = filters.request_type;
  }
  if (filters?.search) {
    sql += ' AND (name LIKE @search OR organization LIKE @search OR email LIKE @search)';
    params.search = `%${filters.search}%`;
  }

  sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all(params) as RequestRow[];
}

export function getRequestById(id: number): RequestRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as RequestRow | undefined;
}

export function createRequest(data: Partial<RequestRow>): RequestRow {
  const db = getDb();
  const fields = [
    'name', 'organization', 'email', 'request_type',
    'materials', 'shipping_address', 'state', 'county', 'date_needed',
    'event_date', 'start_time', 'end_time', 'event_address', 'event_zip',
    'indoor_outdoor', 'parking_instructions', 'target_audience',
    'estimated_attendees', 'topics', 'requestor_attending', 'additional_notes',
  ];

  const presentFields = fields.filter(f => data[f as keyof RequestRow] !== undefined);
  const placeholders = presentFields.map(f => `@${f}`).join(', ');
  const columns = presentFields.join(', ');

  const params: Record<string, unknown> = {};
  for (const f of presentFields) {
    params[f] = data[f as keyof RequestRow] ?? null;
  }

  const stmt = db.prepare(`INSERT INTO requests (${columns}) VALUES (${placeholders})`);
  const result = stmt.run(params);
  return getRequestById(result.lastInsertRowid as number)!;
}

export function updateRequest(id: number, data: Partial<RequestRow>): RequestRow | undefined {
  const db = getDb();
  const allowedFields = [
    'status', 'name', 'organization', 'email', 'request_type',
    'materials', 'shipping_address', 'state', 'county', 'date_needed',
    'event_date', 'start_time', 'end_time', 'event_address', 'event_zip',
    'indoor_outdoor', 'parking_instructions', 'target_audience',
    'estimated_attendees', 'topics', 'requestor_attending', 'additional_notes',
    'ai_priority', 'ai_tags', 'ai_fulfillment_recommendation',
    'ai_notes_analysis', 'ai_geographic_eligible',
    'translation_text', 'translation_detected_language', 'translation_target_language',
    'admin_notes', 'fulfillment_path', 'approved_by', 'approved_at',
    'assigned_staff_id',
  ];

  const updates = allowedFields.filter(f => data[f as keyof RequestRow] !== undefined);
  if (updates.length === 0) return getRequestById(id);

  const setClause = updates.map(f => `${f} = @${f}`).join(', ');
  const params: Record<string, unknown> = { id };
  for (const f of updates) {
    params[f] = data[f as keyof RequestRow] ?? null;
  }

  db.prepare(`UPDATE requests SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run(params);
  return getRequestById(id);
}

export function deleteRequest(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM requests WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getSetting(key: string): string | undefined {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

// --- Inventory ---

export interface InventoryRow {
  id: number;
  item_id: string | null;
  name: string;
  category: string;
  quantity: number;
  low_stock_threshold: number;
  unit: string;
  notes: string | null;
  updated_at: string;
}

export function getAllInventory(): InventoryRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM inventory ORDER BY category, name').all() as InventoryRow[];
}

export function getInventoryById(id: number): InventoryRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM inventory WHERE id = ?').get(id) as InventoryRow | undefined;
}

export function createInventoryItem(data: {
  item_id?: string;
  name: string;
  category: string;
  quantity: number;
  low_stock_threshold?: number;
  unit?: string;
  notes?: string;
}): InventoryRow {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO inventory (item_id, name, category, quantity, low_stock_threshold, unit, notes)
    VALUES (@item_id, @name, @category, @quantity, @low_stock_threshold, @unit, @notes)
  `).run({
    item_id: data.item_id || null,
    name: data.name,
    category: data.category,
    quantity: data.quantity,
    low_stock_threshold: data.low_stock_threshold ?? 50,
    unit: data.unit || 'units',
    notes: data.notes || null,
  });
  return getInventoryById(result.lastInsertRowid as number)!;
}

export function updateInventoryItem(id: number, data: Partial<InventoryRow>): InventoryRow | undefined {
  const db = getDb();
  const allowedFields = ['item_id', 'name', 'category', 'quantity', 'low_stock_threshold', 'unit', 'notes'];
  const updates = allowedFields.filter(f => data[f as keyof InventoryRow] !== undefined);
  if (updates.length === 0) return getInventoryById(id);

  const setClause = updates.map(f => `${f} = @${f}`).join(', ');
  const params: Record<string, unknown> = { id };
  for (const f of updates) {
    params[f] = data[f as keyof InventoryRow] ?? null;
  }

  db.prepare(`UPDATE inventory SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run(params);
  return getInventoryById(id);
}

export function deleteInventoryItem(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
  return result.changes > 0;
}
