import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminCheck";

export async function GET() {
  if (await isAdmin()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
