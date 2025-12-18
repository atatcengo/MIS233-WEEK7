// backend/routes/tasks.ts
import { Hono } from "npm:hono";
import { eq } from "npm:drizzle-orm";
import { orm } from "../db/drizzle.ts";
import { tasks } from "../db/schema.ts";
import { saveDb } from "../db/connection.ts";

export const tasksRoute = new Hono();

// GET /api/tasks?q=keyword
tasksRoute.get("/", async (c) => {
    const q = (c.req.query("q") ?? "").toLowerCase();
    let rows = await orm.select().from(tasks).all();
    if (q) rows = rows.filter((r) => r.title.toLowerCase().includes(q));
    return c.json(rows);
});

// POST /api/tasks
tasksRoute.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim();
    if (!title) return c.json({ error: "title required" }, 400);

    const priority = (body.priority ?? "medium") as string;
    const status = (body.status ?? "todo") as string;
    const module = (body.module ?? null) as string | null;

    const inserted = await orm
        .insert(tasks)
        .values({ title, priority, status, module })
        .returning()
        .get();

    await saveDb();

    const headers = new Headers();
    headers.set("location", `/api/tasks/${inserted.id}`);
    return new Response(JSON.stringify(inserted), {
        status: 201,
        headers,
    });
});

// PUT /api/tasks/:id
tasksRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "invalid id" }, 400);

    const patch = await c.req.json().catch(() => ({}));
    const { id: _ignore, ...safePatch } = patch;

    await orm.update(tasks).set(safePatch).where(eq(tasks.id, id)).run();
    const updated = await orm.select().from(tasks).where(eq(tasks.id, id)).get();
    await saveDb();

    if (!updated) return c.json({ error: "not found" }, 404);
    return c.json(updated);
});

// DELETE /api/tasks/:id
tasksRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) return c.json({ error: "invalid id" }, 400);

    await orm.delete(tasks).where(eq(tasks.id, id)).run();
    await saveDb();
    return c.json({ ok: true });
});
