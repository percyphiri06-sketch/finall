// ==========================================
// TELEGRAM SECURE HOOK ROUTER (Node.js 18+)
// Location: /api/submit.js
// ==========================================
export default async function handler(req, res) {
    // Enforce CORS security boundaries explicitly
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle initial browser security check handshakes
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extract configurations out of backend system environment memories
    const token = process.env.8375892297:AAExTueevYpHpyKxO1qFgf114YwmpSjwxRY;
    const chatId = process.env.8524294724;
    const { message } = req.body;

    if (!token || !chatId) {
        return res.status(500).json({ error: 'Internal configuration issue: Tokens missing.' });
    }

    if (!message) {
        return res.status(400).json({ error: 'Bad Request: Content data is empty.' });
    }

    try {
        const telegramEndpoint = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const response = await fetch(telegramEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });

        const telegramData = await response.json();
        
        if (telegramData.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ error: telegramData.description });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Network transmission failure: ' + err.message });
    }
}
