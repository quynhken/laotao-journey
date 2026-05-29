import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

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
  const provided = c.req.header("x-admin-token") ?? "";
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
    const allowed = ["status", "image", "images", "name", "km", "date", "quote", "locNum", "lat", "lng", "rating", "reviews"];
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

Deno.serve(app.fetch);
