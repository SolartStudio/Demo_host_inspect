export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phone, employees, locations } = req.body || {};

  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

  const text = `📝 Новая заявка с сайта Inspekt.uz

👤 Имя: ${name || '-'}
📞 Телефон: ${phone || '-'}
👥 Сотрудников: ${employees || '-'}
📍 Точек: ${locations || '-'}
🕐 Время: ${now}`;

  // Резервная копия заявки в Google Таблицу — работает независимо от Telegram
  // и не должна ломать основную отправку, даже если сама упадёт с ошибкой.
  const sheetBackup = process.env.LEADS_SHEET_WEBHOOK_URL
    ? fetch(process.env.LEADS_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, employees, locations, receivedAt: now })
      }).catch(err => console.warn('sheet backup failed', err))
    : Promise.resolve();

  const telegramSend = fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
  });

  const [, telegramResult] = await Promise.allSettled([sheetBackup, telegramSend]);

  let data = { ok: false };
  if (telegramResult.status === 'fulfilled') {
    try {
      data = await telegramResult.value.json();
    } catch (err) {
      data = { ok: false, error: 'invalid telegram response' };
    }
  } else {
    data = { ok: false, error: String(telegramResult.reason) };
  }

  res.status(200).json(data);
}
