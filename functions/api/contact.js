export async function onRequest(context) {

  const { env } = context;

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: "✅ Test Cloudflare Pages → Telegram"
      })
    }
  );

  const data = await response.json();

  return Response.json(data);
}