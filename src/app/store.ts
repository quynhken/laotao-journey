import { useSyncExternalStore } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  PROVINCES as DEFAULT_PROVINCES,
  SUB_LOCATIONS as DEFAULT_SUBS,
  STOPS as DEFAULT_STOPS,
  BADGES as DEFAULT_BADGES,
  EPISODE_COLORS as DEFAULT_EPISODE_COLORS,
  TOTAL_KM as DEFAULT_TOTAL_KM,
  CURRENT_KM as DEFAULT_CURRENT_KM,
  type Province,
  type SubLocation,
  type Badge,
} from './components/data';

const STORAGE_KEY = 'lao-tao:settings:v1';

export type VideoItem = {
  id: number;
  url: string;
  title: string;
  place: string;
  date: string;
  quote: string;
  image: string;
  categoryId?: number;
};

export type VideoCategory = {
  id: number;
  name: string;
  color: string;
};

export type AppSettings = {
  header: {
    typewriterNames: string[];
    avatarText: string;
    currentStop: string;
  };
  trip: {
    totalKm: number;
    currentKm: number;
  };
  /** Tổng số dư Ví Point — tích lũy qua các mini game, persist qua sessions */
  viPoint: number;
  /** @deprecated dùng viPoint thay thế */
  initialPoints?: number;
  admin: {
    /** SHA-256 hex của mật khẩu. Rỗng = mặc định "admin". */
    passwordHash: string;
  };
  episodeColors: Record<number, string>;
  badges: Badge[];
  provinces: Province[];
  subLocations: SubLocation[];
  videos: VideoItem[];
  videoCategories: VideoCategory[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  header: {
    typewriterNames: ['Lão Tào', 'PTA'],
    avatarText: 'LT',
    currentStop: 'Hà Giang',
  },
  trip: { totalKm: DEFAULT_TOTAL_KM, currentKm: DEFAULT_CURRENT_KM },
  viPoint: 180,
  admin: { passwordHash: '' },
  episodeColors: { ...DEFAULT_EPISODE_COLORS },
  badges: DEFAULT_BADGES.map((b) => ({ ...b })),
  provinces: DEFAULT_PROVINCES.map((p) => ({ ...p })),
  subLocations: DEFAULT_SUBS.map((s) => ({ ...s })),
  videos: [],
  videoCategories: [],
};

function readStorage(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      header: { ...DEFAULT_SETTINGS.header, ...(parsed.header ?? {}) },
      trip: { ...DEFAULT_SETTINGS.trip, ...(parsed.trip ?? {}) },
      admin: { ...DEFAULT_SETTINGS.admin, ...(parsed.admin ?? {}) },
      episodeColors: { ...DEFAULT_SETTINGS.episodeColors, ...(parsed.episodeColors ?? {}) },
      badges: parsed.badges ?? DEFAULT_SETTINGS.badges,
      provinces: (() => {
        const base = parsed.provinces ?? DEFAULT_SETTINGS.provinces;
        const protectedProvs = DEFAULT_SETTINGS.provinces.filter(p => p.protected);
        const ids = new Set(base.map(p => p.id));
        const missing = protectedProvs.filter(p => !ids.has(p.id));
        return missing.length ? [...base, ...missing] : base;
      })(),
      subLocations: parsed.subLocations ?? DEFAULT_SETTINGS.subLocations,
      videos: parsed.videos ?? DEFAULT_SETTINGS.videos,
      videoCategories: parsed.videoCategories ?? DEFAULT_SETTINGS.videoCategories,
      // migrate: nếu có initialPoints cũ thì dùng làm viPoint
      viPoint: parsed.viPoint ?? (parsed as any).initialPoints ?? DEFAULT_SETTINGS.viPoint,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let state: AppSettings = readStorage();
const listeners = new Set<() => void>();

// Sync mutable exported arrays in data.ts so existing imports stay live.
function syncDataModule(s: AppSettings) {
  DEFAULT_PROVINCES.splice(0, DEFAULT_PROVINCES.length, ...s.provinces);
  DEFAULT_SUBS.splice(0, DEFAULT_SUBS.length, ...s.subLocations);
  DEFAULT_STOPS.splice(0, DEFAULT_STOPS.length, ...s.subLocations.filter((x) => x.locNum === 1));
  DEFAULT_BADGES.splice(0, DEFAULT_BADGES.length, ...s.badges);
  for (const k of Object.keys(DEFAULT_EPISODE_COLORS)) delete (DEFAULT_EPISODE_COLORS as Record<string, string>)[k];
  Object.assign(DEFAULT_EPISODE_COLORS, s.episodeColors);
}
syncDataModule(state);

function emit() {
  syncDataModule(state);
  listeners.forEach((l) => l());
}

export function getSettings(): AppSettings {
  return state;
}

export function setSettings(next: AppSettings | ((prev: AppSettings) => AppSettings)) {
  const value = typeof next === 'function' ? (next as (p: AppSettings) => AppSettings)(state) : next;
  state = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
  emit();
}

export function resetSettings() {
  state = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}

// ── Effective data accessors (merge overrides at read time) ─────────────────
export function getProvinces(): Province[] {
  return state.provinces;
}
export function getSubLocations(): SubLocation[] {
  return state.subLocations;
}
export function getEpisodeColors(): Record<number, string> {
  return state.episodeColors;
}

// ── Admin auth ──────────────────────────────────────────────────────────────
const AUTH_SESSION_KEY = 'lao-tao:admin-auth';
const DEFAULT_PASSWORD = 'admin';

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(input: string): Promise<boolean> {
  const stored = state.admin.passwordHash;
  if (!stored) return input === DEFAULT_PASSWORD;
  const h = await sha256Hex(input);
  return h === stored;
}

export async function setPassword(plain: string): Promise<void> {
  const hash = plain ? await sha256Hex(plain) : '';
  setSettings({ ...state, admin: { ...state.admin, passwordHash: hash } });
}

export function isAuthed(): boolean {
  try { return sessionStorage.getItem(AUTH_SESSION_KEY) === '1'; } catch { return false; }
}
export function setAuthed(v: boolean, token?: string) {
  try {
    if (v) {
      sessionStorage.setItem(AUTH_SESSION_KEY, '1');
      if (token != null) sessionStorage.setItem('lao-tao:admin-token', token);
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem('lao-tao:admin-token');
    }
  } catch {}
}
function getAdminToken(): string {
  try { return sessionStorage.getItem('lao-tao:admin-token') ?? ''; } catch { return ''; }
}

// ── Supabase sync ───────────────────────────────────────────────────────────
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ae2dcaa6`;

export type SyncStatus = 'idle' | 'pulling' | 'pushing' | 'error' | 'ok';
const syncListeners = new Set<() => void>();
let syncSnapshot: { status: SyncStatus; error: string } = { status: 'idle', error: '' };
export function getSyncStatus() { return syncSnapshot; }
function setSync(s: SyncStatus, err = '') {
  if (syncSnapshot.status === s && syncSnapshot.error === err) return;
  syncSnapshot = { status: s, error: err };
  syncListeners.forEach((l) => l());
}
export function useSyncStatus() {
  return useSyncExternalStore(
    (cb) => { syncListeners.add(cb); return () => syncListeners.delete(cb); },
    getSyncStatus,
    getSyncStatus,
  );
}

export async function pullSettings(): Promise<boolean> {
  setSync('pulling');
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.settings) {
      const mergedProvinces = (() => {
        const base: Province[] = data.settings.provinces ?? DEFAULT_SETTINGS.provinces;
        const protectedProvs = DEFAULT_SETTINGS.provinces.filter(p => p.protected);
        const ids = new Set(base.map(p => p.id));
        const missing = protectedProvs.filter(p => !ids.has(p.id));
        return missing.length ? [...base, ...missing] : base;
      })();
      const merged: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
        provinces: mergedProvinces,
        header: { ...DEFAULT_SETTINGS.header, ...(data.settings.header ?? {}) },
        trip: { ...DEFAULT_SETTINGS.trip, ...(data.settings.trip ?? {}) },
        admin: { ...DEFAULT_SETTINGS.admin, ...(data.settings.admin ?? {}) },
        episodeColors: { ...DEFAULT_SETTINGS.episodeColors, ...(data.settings.episodeColors ?? {}) },
      };
      setSettings(merged);
    }
    setSync('ok');
    return true;
  } catch (err) {
    const msg = `Pull settings failed: ${String(err)}`;
    console.log(msg);
    setSync('error', msg);
    return false;
  }
}

export async function pushSettings(value?: AppSettings): Promise<boolean> {
  setSync('pushing');
  // Pass admin token as query param to avoid CORS preflight blocking custom headers
  const tok = getAdminToken();
  const url = tok ? `${API_BASE}/settings?adminToken=${encodeURIComponent(tok)}` : `${API_BASE}/settings`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ settings: value ?? state }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`HTTP ${res.status}: ${t}`);
    }
    setSync('ok');
    return true;
  } catch (err) {
    const msg = `Push settings failed: ${String(err)}`;
    console.log(msg);
    setSync('error', msg);
    return false;
  }
}

// ── Granular province / sublocation API ─────────────────────────────────────

export async function patchProvince(id: number, updates: Partial<Province>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/provinces/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
        'x-admin-token': getAdminToken(),
      },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function patchSubLocation(id: number, updates: Partial<SubLocation>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sublocations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
        'x-admin-token': getAdminToken(),
      },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createSubLocation(data: Omit<SubLocation, 'id'>): Promise<SubLocation | null> {
  try {
    const res = await fetch(`${API_BASE}/sublocations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
        'x-admin-token': getAdminToken(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.subLocation ?? null;
  } catch {
    return null;
  }
}

export async function deleteSubLocation(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sublocations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'x-admin-token': getAdminToken(),
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Videos API ───────────────────────────────────────────────────────────────

export async function patchVideo(id: number, updates: Partial<VideoItem>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch { return false; }
}

export async function createVideo(data: Omit<VideoItem, 'id'>): Promise<VideoItem | null> {
  try {
    const res = await fetch(`${API_BASE}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return (await res.json()).video ?? null;
  } catch { return null; }
}

export async function deleteVideo(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
    });
    return res.ok;
  } catch { return false; }
}

// ── Categories API ───────────────────────────────────────────────────────────

export async function createCategory(data: Omit<VideoCategory, 'id'>): Promise<VideoCategory | null> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return (await res.json()).category ?? null;
  } catch { return null; }
}

export async function patchCategory(id: number, updates: Partial<Omit<VideoCategory, 'id'>>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch { return false; }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${publicAnonKey}`, 'x-admin-token': getAdminToken() },
    });
    return res.ok;
  } catch { return false; }
}

// ── Image upload to Supabase Storage ─────────────────────────────────────────

export async function uploadImage(base64: string, filename = 'image.jpg'): Promise<string | null> {
  const tok = getAdminToken();
  const url = tok
    ? `${API_BASE}/upload?adminToken=${encodeURIComponent(tok)}`
    : `${API_BASE}/upload`;
  try {
    const contentType = base64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ data: base64, filename, contentType }),
    });
    if (!res.ok) return null;
    return (await res.json()).url ?? null;
  } catch { return null; }
}

// ── Ví Point API ─────────────────────────────────────────────────────────────

/** Cộng điểm vào Ví Point — cập nhật store ngay, đồng bộ server trong nền */
export function earnViPoint(amount: number): void {
  const next = (state.viPoint ?? 0) + amount;
  setSettings({ ...state, viPoint: next });
  // Sync to server in background (fire & forget)
  fetch(`${API_BASE}/vi-point/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
    body: JSON.stringify({ amount }),
  }).catch(() => {});
}

/** Admin đặt số dư Ví Point */
export async function setViPointBalance(balance: number): Promise<boolean> {
  const tok = getAdminToken();
  const url = tok
    ? `${API_BASE}/vi-point?adminToken=${encodeURIComponent(tok)}`
    : `${API_BASE}/vi-point`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ balance }),
    });
    return res.ok;
  } catch { return false; }
}

/** Admin cập nhật trip (totalKm, currentKm) */
export async function patchTrip(updates: Partial<AppSettings['trip']>): Promise<boolean> {
  const tok = getAdminToken();
  const url = tok
    ? `${API_BASE}/trip?adminToken=${encodeURIComponent(tok)}`
    : `${API_BASE}/trip`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch { return false; }
}

/** Admin cập nhật header (currentStop, avatarText, typewriterNames) */
export async function patchHeader(updates: Partial<AppSettings['header']>): Promise<boolean> {
  const tok = getAdminToken();
  const url = tok
    ? `${API_BASE}/header?adminToken=${encodeURIComponent(tok)}`
    : `${API_BASE}/header`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch { return false; }
}
