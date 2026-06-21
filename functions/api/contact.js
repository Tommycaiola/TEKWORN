export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    let { nome, email, messaggio, servizio } = data;

    // ---------------------------
    // 1. VALIDAZIONE BASE
    // ---------------------------
    if (!nome || !email || !messaggio || !servizio) {
      return Response.json(
        { success: false, error: "Campi mancanti" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 2. NORMALIZZAZIONE (anti injection base)
    // ---------------------------
    nome = nome.toString().trim();
    email = email.toString().trim().toLowerCase();
    messaggio = messaggio.toString().trim();
    servizio = servizio.toString().trim();

    // ---------------------------
    // 3. VALIDAZIONE EMAIL SERIA
    // ---------------------------
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "Email non valida" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 4. WHITELIST SERVIZIO (IMPORTANTISSIMO)
    // ---------------------------
    const allowedServices = [
      "Sito web",
      "Software",
      "Automazione"
    ];

    if (!allowedServices.includes(servizio)) {
      return Response.json(
        { success: false, error: "Servizio non valido" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 5. LIMITI ANTI-SPAM
    // ---------------------------
    if (nome.length > 100 || messaggio.length > 3000) {
      return Response.json(
        { success: false, error: "Input troppo lungo" },
        { status: 400 }
      );
    }

    // blocco injection base
    const forbiddenPatterns = [
      "<script",
      "http://",
      "https://",
      "DROP ",
      "SELECT ",
      "--",
      "/*",
      "*/"
    ];

    const allText = `${nome} ${messaggio}`;

    if (
      forbiddenPatterns.some(p =>
        allText.toUpperCase().includes(p.toUpperCase())
      )
    ) {
      return Response.json(
        { success: false, error: "Contenuto non valido" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 6. MESSAGGIO TELEGRAM
    // ---------------------------
    const text =
`📩 Nuova richiesta dal sito

👤 Nome: ${nome}
📧 Email: ${email}
🧩 Servizio: ${servizio}

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

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { success: false, error: "Errore server" },
      { status: 500 }
    );
  }
}