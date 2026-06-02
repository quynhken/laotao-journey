import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const BUCKET = "location-images";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-admin-token"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const SETTINGS_KEY = "lao-tao:settings";

function checkAdmin(c: any): Response | null {
  const required = Deno.env.get("ADMIN_TOKEN") ?? "";
  if (!required) return null;
  // Accept token from header OR query param (query param avoids CORS preflight issues)
  const provided =
    c.req.header("x-admin-token") ||
    c.req.query("adminToken") ||
    "";
  if (provided !== required) return c.json({ error: "Unauthorized: bad admin token" }, 401) as any;
  return null;
}

app.get("/make-server-ae2dcaa6/health", (c) => c.json({ status: "ok" }));

// ── Settings (bulk) ──────────────────────────────────────────────────────────

app.get("/make-server-ae2dcaa6/settings", async (c) => {
  try {
    const value = await kv.get(SETTINGS_KEY);
    return c.json({ settings: value ?? null });
  } catch (err) {
    console.log(`Error reading settings: ${err}`);
    return c.json({ error: `Failed to read settings: ${String(err)}` }, 500);
  }
});

app.put("/make-server-ae2dcaa6/settings", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    if (!body || typeof body !== "object" || !("settings" in body)) {
      return c.json({ error: "Body must be { settings: AppSettings }" }, 400);
    }
    await kv.set(SETTINGS_KEY, body.settings);
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Error writing settings: ${err}`);
    return c.json({ error: `Failed to write settings: ${String(err)}` }, 500);
  }
});

// ── Provinces ────────────────────────────────────────────────────────────────

// GET /provinces  — public; returns all provinces with sublocation counts
app.get("/make-server-ae2dcaa6/provinces", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ provinces: [] });
    const provinces = (settings.provinces ?? []).map((p: any) => ({
      ...p,
      subLocationCount: (settings.subLocations ?? []).filter((s: any) => s.provinceId === p.id).length,
    }));
    return c.json({ provinces });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// GET /provinces/:id  — public; returns province + its sorted sublocations
app.get("/make-server-ae2dcaa6/provinces/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Not found" }, 404);
    const province = (settings.provinces ?? []).find((p: any) => p.id === id);
    if (!province) return c.json({ error: "Province not found" }, 404);
    const subLocations = (settings.subLocations ?? [])
      .filter((s: any) => s.provinceId === id)
      .sort((a: any, b: any) => a.locNum - b.locNum);
    return c.json({ province, subLocations });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /provinces/:id  — admin; update allowed province fields
app.patch("/make-server-ae2dcaa6/provinces/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const idx = (settings.provinces ?? []).findIndex((p: any) => p.id === id);
    if (idx === -1) return c.json({ error: "Province not found" }, 404);
    const allowed = ["status", "image", "name", "lat", "lng", "episode", "region"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }
    settings.provinces[idx] = { ...settings.provinces[idx], ...patch };
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ province: settings.provinces[idx] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Sub-locations ─────────────────────────────────────────────────────────────

// GET /sublocations?provinceId=  — public
app.get("/make-server-ae2dcaa6/sublocations", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ subLocations: [] });
    let subs: any[] = settings.subLocations ?? [];
    const pid = c.req.query("provinceId");
    if (pid) subs = subs.filter((s: any) => s.provinceId === Number(pid));
    subs = [...subs].sort((a: any, b: any) => a.provinceId - b.provinceId || a.locNum - b.locNum);
    return c.json({ subLocations: subs });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /sublocations/:id  — admin
app.patch("/make-server-ae2dcaa6/sublocations/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const idx = (settings.subLocations ?? []).findIndex((s: any) => s.id === id);
    if (idx === -1) return c.json({ error: "SubLocation not found" }, 404);
    const allowed = ["status", "image", "images", "name", "km", "date", "quote", "locNum", "lat", "lng", "rating", "reviews", "episode"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }
    settings.subLocations[idx] = { ...settings.subLocations[idx], ...patch };
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ subLocation: settings.subLocations[idx] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /sublocations  — admin; create new sub-location
app.post("/make-server-ae2dcaa6/sublocations", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    if (!body.provinceId) return c.json({ error: "provinceId is required" }, 400);
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const maxId = (settings.subLocations ?? []).reduce((m: number, s: any) => Math.max(m, s.id), 0);
    const newSub = { ...body, id: maxId + 1 };
    settings.subLocations = [...(settings.subLocations ?? []), newSub];
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ subLocation: newSub }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// DELETE /sublocations/:id  — admin
app.delete("/make-server-ae2dcaa6/sublocations/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const before = (settings.subLocations ?? []).length;
    settings.subLocations = (settings.subLocations ?? []).filter((s: any) => s.id !== id);
    if (settings.subLocations.length === before) return c.json({ error: "SubLocation not found" }, 404);
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Image upload → Supabase Storage ──────────────────────────────────────────

// POST /upload  — admin; accepts { data: base64, filename?, contentType? }
app.post("/make-server-ae2dcaa6/upload", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;

    const body = await c.req.json();
    if (!body?.data) return c.json({ error: "data is required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Ensure bucket exists (idempotent)
    await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    // Decode base64 → bytes
    const raw: string = body.data;
    const b64 = raw.includes(",") ? raw.split(",")[1] : raw;
    const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));

    const ext = (body.contentType ?? "image/jpeg").includes("png") ? "png" : "jpg";
    const name = `${Date.now()}-${(body.filename ?? `img.${ext}`).replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { data: uploaded, error } = await supabase.storage
      .from(BUCKET)
      .upload(name, bytes, { contentType: body.contentType ?? "image/jpeg", upsert: false });

    if (error) return c.json({ error: error.message }, 500);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploaded.path);
    return c.json({ url: urlData.publicUrl });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Visitors ─────────────────────────────────────────────────────────────────
const VISITORS_KEY = "lao-tao:visitors";

// POST /visitors  — public; register a visitor on onboarding
app.post("/make-server-ae2dcaa6/visitors", async (c) => {
  try {
    const body = await c.req.json();
    if (!body?.name?.trim()) return c.json({ error: "name is required" }, 400);
    const visitors: any[] = (await kv.get(VISITORS_KEY)) ?? [];
    const maxId = visitors.reduce((m: number, v: any) => Math.max(m, v.id ?? 0), 0);
    const entry = {
      id: maxId + 1,
      name: body.name.trim(),
      joinedAt: new Date().toISOString(),
      points: 0,
      lastSeen: new Date().toISOString(),
      device: body.device ?? '',
      os: body.os ?? '',
      browser: body.browser ?? '',
      language: body.language ?? '',
      timezone: body.timezone ?? '',
      screen: body.screen ?? '',
      referrer: body.referrer ?? '',
    };
    visitors.push(entry);
    await kv.set(VISITORS_KEY, visitors);
    return c.json({ visitor: entry }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// GET /visitors  — admin; list all visitors
app.get("/make-server-ae2dcaa6/visitors", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const visitors: any[] = (await kv.get(VISITORS_KEY)) ?? [];
    return c.json({ visitors: visitors.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)) });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /visitors/:id  — public; update points and lastSeen
app.patch("/make-server-ae2dcaa6/visitors/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const visitors: any[] = (await kv.get(VISITORS_KEY)) ?? [];
    const idx = visitors.findIndex((v: any) => v.id === id);
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    if (typeof body.points === "number") {
      // Only allow setting points if it's a small increment over current value (max +500)
      const current = visitors[idx].points ?? 0;
      const newPoints = Math.max(current, Math.min(body.points, current + 500));
      visitors[idx].points = newPoints;
    }
    visitors[idx].lastSeen = new Date().toISOString();
    await kv.set(VISITORS_KEY, visitors);
    return c.json({ visitor: visitors[idx] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// DELETE /visitors/:id  — admin
app.delete("/make-server-ae2dcaa6/visitors/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const visitors: any[] = (await kv.get(VISITORS_KEY)) ?? [];
    const filtered = visitors.filter((v: any) => v.id !== id);
    await kv.set(VISITORS_KEY, filtered);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Onboarding Photos ─────────────────────────────────────────────────────────
const ONBOARDING_PHOTOS_KEY = "lao-tao:onboarding-photos";

// GET /onboarding-photos  — public
app.get("/make-server-ae2dcaa6/onboarding-photos", async (c) => {
  try {
    const photos: any[] = (await kv.get(ONBOARDING_PHOTOS_KEY)) ?? [];
    return c.json({ photos });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /onboarding-photos  — admin; upload base64 image
app.post("/make-server-ae2dcaa6/onboarding-photos", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;

    const body = await c.req.json();
    if (!body?.data) return c.json({ error: "data is required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    const raw: string = body.data;
    const b64 = raw.includes(",") ? raw.split(",")[1] : raw;
    const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
    const contentType = body.contentType ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const name = `onboarding/${Date.now()}.${ext}`;

    const { data: uploaded, error } = await supabase.storage
      .from(BUCKET)
      .upload(name, bytes, { contentType, upsert: false });
    if (error) return c.json({ error: error.message }, 500);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploaded.path);
    const photos: any[] = (await kv.get(ONBOARDING_PHOTOS_KEY)) ?? [];
    const maxId = photos.reduce((m: number, p: any) => Math.max(m, p.id ?? 0), 0);
    const entry = { id: maxId + 1, url: urlData.publicUrl, uploadedAt: new Date().toISOString() };
    photos.push(entry);
    await kv.set(ONBOARDING_PHOTOS_KEY, photos);
    return c.json({ photo: entry }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// DELETE /onboarding-photos/:id  — admin
app.delete("/make-server-ae2dcaa6/onboarding-photos/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const photos: any[] = (await kv.get(ONBOARDING_PHOTOS_KEY)) ?? [];
    const filtered = photos.filter((p: any) => p.id !== id);
    await kv.set(ONBOARDING_PHOTOS_KEY, filtered);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Trip ─────────────────────────────────────────────────────────────────────

// GET /trip  — public
app.get("/make-server-ae2dcaa6/trip", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    return c.json({ trip: settings?.trip ?? null });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /trip  — admin; update totalKm and/or currentKm
app.patch("/make-server-ae2dcaa6/trip", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const patch: Record<string, any> = {};
    if (typeof body.totalKm === "number") patch.totalKm = body.totalKm;
    if (typeof body.currentKm === "number") patch.currentKm = body.currentKm;
    settings.trip = { ...(settings.trip ?? {}), ...patch };
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ trip: settings.trip });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Header ────────────────────────────────────────────────────────────────────

// GET /header  — public
app.get("/make-server-ae2dcaa6/header", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    return c.json({ header: settings?.header ?? null });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /header  — admin; update currentStop, avatarText, typewriterNames
app.patch("/make-server-ae2dcaa6/header", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const allowed = ["currentStop", "avatarText", "typewriterNames"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }
    settings.header = { ...(settings.header ?? {}), ...patch };
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ header: settings.header });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Ví Point ──────────────────────────────────────────────────────────────────

// GET /vi-point  — public; returns current balance
app.get("/make-server-ae2dcaa6/vi-point", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    const balance = settings?.viPoint ?? settings?.initialPoints ?? 0;
    return c.json({ balance });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /vi-point  — admin; set wallet balance
app.patch("/make-server-ae2dcaa6/vi-point", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    if (typeof body.balance !== "number") return c.json({ error: "balance must be a number" }, 400);
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    settings.viPoint = body.balance;
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ balance: settings.viPoint });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /vi-point/add  — public; add earned points from mini games
app.post("/make-server-ae2dcaa6/vi-point/add", async (c) => {
  try {
    const body = await c.req.json();
    const amount = Math.min(Math.max(Number(body.amount), 0), 500); // cap 0–500
    if (!amount) return c.json({ error: "amount must be 1–500" }, 400);
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const prev = settings.viPoint ?? settings.initialPoints ?? 0;
    settings.viPoint = prev + amount;
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ balance: settings.viPoint, added: amount });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Videos ────────────────────────────────────────────────────────────────────

// GET /videos?categoryId=  — public
app.get("/make-server-ae2dcaa6/videos", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ videos: [] });
    let videos: any[] = settings.videos ?? [];
    const catId = c.req.query("categoryId");
    if (catId) videos = videos.filter((v: any) => v.categoryId === Number(catId));
    return c.json({ videos });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /videos  — admin
app.post("/make-server-ae2dcaa6/videos", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const maxId = (settings.videos ?? []).reduce((m: number, v: any) => Math.max(m, v.id), 0);
    const newVideo = { ...body, id: maxId + 1 };
    settings.videos = [...(settings.videos ?? []), newVideo];
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ video: newVideo }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /videos/:id  — admin
app.patch("/make-server-ae2dcaa6/videos/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const idx = (settings.videos ?? []).findIndex((v: any) => v.id === id);
    if (idx === -1) return c.json({ error: "Video not found" }, 404);
    const allowed = ["url", "title", "place", "date", "quote", "image", "categoryId"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }
    settings.videos[idx] = { ...settings.videos[idx], ...patch };
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ video: settings.videos[idx] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// DELETE /videos/:id  — admin
app.delete("/make-server-ae2dcaa6/videos/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const before = (settings.videos ?? []).length;
    settings.videos = (settings.videos ?? []).filter((v: any) => v.id !== id);
    if (settings.videos.length === before) return c.json({ error: "Video not found" }, 404);
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Categories ────────────────────────────────────────────────────────────────

// GET /categories  — public
app.get("/make-server-ae2dcaa6/categories", async (c) => {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ categories: [] });
    return c.json({ categories: settings.videoCategories ?? [] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /categories  — admin
app.post("/make-server-ae2dcaa6/categories", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const body = await c.req.json();
    if (!body.name) return c.json({ error: "name is required" }, 400);
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const cats: any[] = settings.videoCategories ?? [];
    const maxId = cats.reduce((m: number, c: any) => Math.max(m, c.id), 0);
    const newCat = { id: maxId + 1, name: body.name, color: body.color ?? "#FF631F" };
    settings.videoCategories = [...cats, newCat];
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ category: newCat }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// PATCH /categories/:id  — admin
app.patch("/make-server-ae2dcaa6/categories/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const cats: any[] = settings.videoCategories ?? [];
    const idx = cats.findIndex((cat: any) => cat.id === id);
    if (idx === -1) return c.json({ error: "Category not found" }, 404);
    const patch: Record<string, any> = {};
    if ("name" in body) patch.name = body.name;
    if ("color" in body) patch.color = body.color;
    cats[idx] = { ...cats[idx], ...patch };
    settings.videoCategories = cats;
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ category: cats[idx] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// DELETE /categories/:id  — admin; unlinks videos in that category
app.delete("/make-server-ae2dcaa6/categories/:id", async (c) => {
  try {
    const authErr = checkAdmin(c);
    if (authErr) return authErr;
    const id = Number(c.req.param("id"));
    const settings = await kv.get(SETTINGS_KEY);
    if (!settings) return c.json({ error: "Settings not found" }, 404);
    const before = (settings.videoCategories ?? []).length;
    settings.videoCategories = (settings.videoCategories ?? []).filter((cat: any) => cat.id !== id);
    if (settings.videoCategories.length === before) return c.json({ error: "Category not found" }, 404);
    // Unlink videos belonging to deleted category
    settings.videos = (settings.videos ?? []).map((v: any) =>
      v.categoryId === id ? { ...v, categoryId: undefined } : v
    );
    await kv.set(SETTINGS_KEY, settings);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Reviews per sublocation ───────────────────────────────────────────────────
const REVIEWS_KEY = "lao-tao:sub-reviews";

// GET /sub-reviews/:id  — public; get all reviews for a sublocation
app.get("/make-server-ae2dcaa6/sub-reviews/:id", async (c: any) => {
  try {
    const id = String(c.req.param("id"));
    const all: Record<string, any[]> = (await kv.get(REVIEWS_KEY)) ?? {};
    return c.json({ reviews: (all[id] ?? []).slice().reverse() });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /sub-reviews/:id  — public; submit a review
app.post("/make-server-ae2dcaa6/sub-reviews/:id", async (c: any) => {
  try {
    const id = String(c.req.param("id"));
    const body = await c.req.json();
    if (!body?.name?.trim()) return c.json({ error: "name required" }, 400);
    const all: Record<string, any[]> = (await kv.get(REVIEWS_KEY)) ?? {};
    if (!all[id]) all[id] = [];
    const entry = {
      id: Date.now(),
      name: String(body.name).trim().slice(0, 40),
      stars: Math.min(5, Math.max(1, Number(body.stars) || 5)),
      text: String(body.text || '').slice(0, 150),
      chips: Array.isArray(body.chips) ? body.chips.slice(0, 6) : [],
      createdAt: new Date().toISOString(),
    };
    all[id].push(entry);
    await kv.set(REVIEWS_KEY, all);
    return c.json({ review: entry }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── Reactions (like / dislike / share per sublocation) ───────────────────────
const REACTIONS_KEY = "lao-tao:reactions";

// GET /reactions  — public; returns all reaction counts
app.get("/make-server-ae2dcaa6/reactions", async (c: any) => {
  try {
    const reactions = (await kv.get(REACTIONS_KEY)) ?? {};
    return c.json({ reactions });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// POST /reactions/:id/:type  — public; increment like | dislike | share
app.post("/make-server-ae2dcaa6/reactions/:id/:type", async (c: any) => {
  try {
    const id = String(c.req.param("id"));
    const type = c.req.param("type");
    if (!["like", "dislike", "share"].includes(type)) {
      return c.json({ error: "type must be like | dislike | share" }, 400);
    }
    const reactions: Record<string, any> = (await kv.get(REACTIONS_KEY)) ?? {};
    if (!reactions[id]) reactions[id] = { like: 0, dislike: 0, share: 0 };
    reactions[id][type] = (reactions[id][type] ?? 0) + 1;
    await kv.set(REACTIONS_KEY, reactions);
    return c.json({ id, ...reactions[id] });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

Deno.serve(app.fetch);
