export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const data = await request.json();

    const nome = data.nome?.trim();
    const email = data.email?.trim();
    const messaggio = data.messaggio?.trim();

    if (!nome || !email || !messaggio) {
      return Response.json(
        { success: false, error: "Campi mancanti" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "Email non valida" },
        { status: 400 }
      );
    }

    if (messaggio.length > 2000) {
      return Response.json(
        { success: false, error: "Messaggio troppo lungo" },
        { status: 400 }
      );
    }

    const text =
`📩 Nuova richiesta dal sito

👤 Nome:
${nome}

📧 Email:
${email}

💬 Messaggio:
${messaggio}`;

    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text
        })
      }
    );

    return Response.json({
      success: true
    });

  } catch (err) {

    return Response.json(
      {
        success: false,
        error: "Errore server"
      },
      {
        status: 500
      }
    );

  }
}