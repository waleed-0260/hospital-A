import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = process.env.WHATSAPP_TOKEN?.trim();
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

    if (!token || !phoneNumberId) {
      console.error("Missing WhatsApp environment variables");
      return new Response("Server configuration error", {
        status: 500,
      });
    }

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Ignore delivery/read status updates
    if (!message) {
      return new Response("OK", { status: 200 });
    }

    const from = message.from;
    console.log("incoming message", message)
    console.log("Incoming message from:", from);
    console.log("Token length:", token.length);
    console.log("Phone Number ID:", phoneNumberId);

    const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        type: "text",
        text: {
          body: "Hello! Your clinic bot is working.",
        },
      }),
    });

    const result = await res.text();

    console.log("WhatsApp API status:", res.status);
    console.log("WhatsApp API response:", result);

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("WhatsApp API error:", error);

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}



export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const mode = p.get("hub.mode");
  const token = p.get("hub.verify_token");
  const challenge = p.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}
