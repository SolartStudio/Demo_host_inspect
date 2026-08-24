export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phone, employees, locations } = req.body || {};

  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

  const text = `🆕 Новая заявка с сайта Inspekt.uz

👤 Имя: ${name || '-'}
📞 Телефон: ${phone || '-'}
👥 Сотрудников: ${employees || '-'}
📍 Точек: ${locations || '-'}
🕐 Время: ${now}`;

  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
  });
  const data = await r.json();
  res.status(200).json(data);
}
