import { NextRequest, NextResponse } from "next/server";
import { initializeWhatsAppAccount } from "@/lib/whatsapp-init";

export async function GET(request: NextRequest) {
  try {
    const result = await initializeWhatsAppAccount();

    if (result.success) {
      return NextResponse.json({ message: "WhatsApp account initialized successfully!" });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in WhatsApp initialization API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}