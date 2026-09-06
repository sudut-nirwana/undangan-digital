export async function onRequestPost(context) {
    try {
        const { email } = await context.request.json();
        
        if (!email) {
            return new Response(JSON.stringify({ success: false, error: 'Email wajib diisi' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const cleanEmail = email.trim().toLowerCase();
        
        // Validasi format email standar yang konsisten
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return new Response(JSON.stringify({ success: false, error: 'Format email tidak valid' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        await context.env.DB.prepare(
            "INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, datetime('now'))"
        ).bind(cleanEmail).run();

        return new Response(JSON.stringify({ success: true, message: 'Berhasil berlangganan!' }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}