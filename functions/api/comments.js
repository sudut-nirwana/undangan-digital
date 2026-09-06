import crypto from 'node:crypto';

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT id, parent_id, name, email_hash, message, likes, created_at FROM comments WHERE article_slug = ? ORDER BY created_at ASC"
        ).bind(slug).all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        let { slug, name, email, message, parent_id, subscribe } = body;
        
        if (!slug || slug.includes('{{')) slug = 'home';
        const cleanName = name?.trim();
        const cleanEmail = email?.trim().toLowerCase();
        const cleanMessage = message?.trim();

        if (!slug || !cleanName || !cleanEmail || !cleanMessage) {
            return new Response(JSON.stringify({ success: false, error: 'Data tidak lengkap' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (cleanName.length < 2 || cleanName.length > 50) return new Response(JSON.stringify({ success: false, error: 'Nama 2-50 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        if (cleanMessage.length < 3 || cleanMessage.length > 1000) return new Response(JSON.stringify({ success: false, error: 'Komentar 3-1000 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) return new Response(JSON.stringify({ success: false, error: 'Email tidak valid' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

        const email_hash = crypto.createHash('md5').update(cleanEmail).digest('hex');

        // PERBAIKAN QUERY SQL: Pastikan 7 kolom cocok dengan 7 parameter bind di bawah
        await context.env.DB.prepare(
            "INSERT INTO comments (article_slug, parent_id, name, email_hash, message, likes, created_at) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))"
        ).bind(slug, parent_id || null, cleanName, email_hash, cleanMessage).run();

        if (subscribe) {
            context.waitUntil(
                context.env.DB.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, datetime('now'))").bind(cleanEmail).run()
            );
        }

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function onRequestPatch(context) {
    try {
        const { id } = await context.request.json();
        if (!id) return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        await context.env.DB.prepare("UPDATE comments SET likes = likes + 1 WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}