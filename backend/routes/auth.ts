// backend/routes/auth.ts
import { Hono } from "npm:hono";
import { eq } from "npm:drizzle-orm";
import { orm } from "../db/drizzle.ts";
import { users } from "../db/schema.ts";

export const authRoute = new Hono();

// POST /api/auth/register
authRoute.post("/register", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    if (!username || !password) {
        return c.json({ error: "Username and password required" }, 400);
    }

    try {
        const newUser = await orm.insert(users)
            .values({ username, password })
            .returning()
            .get();

        return c.json({ ok: true, user: newUser });
    } catch (err) {
        console.error("Registration Error:", err);
        return c.json({ error: "Username already taken or error occurred" }, 409);
    }
});

// POST /api/auth/login
authRoute.post("/login", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    const foundUser = await orm.select()
        .from(users)
        .where(eq(users.username, username))
        .get();

    if (!foundUser || foundUser.password !== password) {
        return c.json({ error: "Invalid username or password" }, 401);
    }

    return c.json({ ok: true, user: foundUser });
});