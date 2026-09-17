import { hash } from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (!email || !password || String(password).length < 8)
    return NextResponse.json(
      { error: "Use a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  try {
    await prisma.user.create({
      data: {
        name: String(name || "").trim() || null,
        email: String(email).toLowerCase().trim(),
        passwordHash: await hash(String(password), 12),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }
}
