import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const success = await login(password);

  if (!success) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
