import { NextRequest } from "next/server";

// Meta calls this once when you click "Verify and save"
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

// Meta calls this for every incoming message
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(JSON.stringify(body, null, 2));
  return new Response("OK", { status: 200 });
}