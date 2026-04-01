import fs from "fs";
import path from "path";

// In-memory user store (persists across requests in the same serverless instance)
const memoryStore = {};

// File path for local dev persistence
const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function loadFromDisk() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      Object.assign(memoryStore, data);
    }
  } catch {}
}

function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryStore, null, 2));
  } catch {}
}

// Load existing users on module init
loadFromDisk();

export function getUsers() {
  return memoryStore;
}

export function getUser(email) {
  return memoryStore[email] || null;
}

export function saveUser(email, hashedPassword) {
  memoryStore[email] = { email, password: hashedPassword, createdAt: new Date().toISOString() };
  saveToDisk();
}
