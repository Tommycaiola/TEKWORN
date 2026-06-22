export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    let { nome, email, telefono, messaggio, servizio } = data;

    // ---------------------------
    // 1. VALIDAZIONE BASE
    // ---------------------------
    if (!nome || !email || !telefono || !messaggio || !servizio) {
      return Response.json(
        { success: false, error: "Campi mancanti" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 2. NORMALIZZAZIONE (anti injection base)
    // ---------------------------
    nome     = nome.toString().trim();
    email    = email.toString().trim().toLowerCase();
    telefono = telefono.toString().trim();
    messaggio = messaggio.toString().trim();
    servizio  = servizio.toString().trim();

    // ---------------------------
    // 3. VALIDAZIONE EMAIL RAFFORZATA
    // ---------------------------
    // Struttura: local@domain.tld — niente punti consecutivi, niente punti
    // all'inizio/fine della parte locale, TLD minimo 2 caratteri.
    const emailRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email) || email.includes("..")) {
      return Response.json(
        { success: false, error: "Email non valida" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 4. VALIDAZIONE TELEFONO
    // ---------------------------
    // Rimuove spazi, trattini, parentesi e "+" iniziale per ottenere solo cifre
    const phoneDigits = telefono.replace(/[\s\-().]/g, "").replace(/^\+/, "");

    if (!/^\d{7,15}$/.test(phoneDigits)) {
      return Response.json(
        { success: false, error: "Numero di telefono non valido" },
        { status: 400 }
      );
    }

    // Blocco numeri palesemente fittizi: tutte cifre uguali
    if (/^(\d)\1+$/.test(phoneDigits)) {
      return Response.json(
        { success: false, error: "Numero di telefono non valido" },
        { status: 400 }
      );
    }

    // Blocco sequenze crescenti/decrescenti (es. 1234567, 9876543)
    let ascending = true;
    let descending = true;
    for (let i = 1; i < phoneDigits.length; i++) {
      if (+phoneDigits[i] !== +phoneDigits[i - 1] + 1) ascending = false;
      if (+phoneDigits[i] !== +phoneDigits[i - 1] - 1) descending = false;
    }
    if (ascending || descending) {
      return Response.json(
        { success: false, error: "Numero di telefono non valido" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 5. WHITELIST SERVIZIO
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
    // 6. LIMITI ANTI-SPAM
    // ---------------------------
    if (nome.length > 100 || messaggio.length > 3000) {
      return Response.json(
        { success: false, error: "Input troppo lungo" },
        { status: 400 }
      );
    }

    // Blocco injection base su testo libero
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
    // 7. MESSAGGIO TELEGRAM
    // ---------------------------
    const text =
`📩 Nuova richiesta dal sito

👤 Nome: ${nome}
📧 Email: ${email}
📞 Telefono: ${telefono}
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