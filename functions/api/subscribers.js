export async function onRequestGet(context) {
    try {
        const db = context.env.DB;
        const { results } = await db.prepare("SELECT id, email, created_at FROM subscribers ORDER BY id DESC").all();
        return new Response(JSON.stringify(results || []), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        const db = context.env.DB;

        if (!id) {
            return new Response(JSON.stringify({ success: false, error: 'ID subscriber tidak valid.' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.prepare("DELETE FROM subscribers WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}