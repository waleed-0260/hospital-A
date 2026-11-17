import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Meta also sends delivery/read status updates. Ignore those.
  if (!message) return new Response("OK", { status: 200 });

  const from = message.from; // patient's phone number
  console.log("Incoming:", from, message.text?.body);

  const res = await fetch(
    `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "Hello! Your clinic bot is working." },
      }),
    }
  );

  console.log("Send result:", res.status, await res.text());
  return new Response("OK", { status: 200 });
}