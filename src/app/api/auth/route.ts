import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (verifyPassword(password)) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", password, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "رمز اشتباه است" }, { status: 401 });
}
