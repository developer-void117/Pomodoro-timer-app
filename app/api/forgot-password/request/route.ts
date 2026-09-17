import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { sendPasswordResetOtp } from "../../../../lib/email";

const WINDOW_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, { count: number; expiresAt: number }>();

function digest(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const generic = { message: "If an account exists for that email, a reset code has been sent." };
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json(generic);

    const now = Date.now();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rateKey = `${ip}:${email}`;
    const rate = requestLog.get(rateKey);
    if (!rate || rate.expiresAt <= now) requestLog.set(rateKey, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    else if (rate.count >= MAX_REQUESTS_PER_WINDOW) return NextResponse.json(generic);
    else rate.count += 1;

    const existing = await prisma.passwordReset.findUnique({ where: { email } });
    if (existing && Date.now() - existing.createdAt.getTime() < COOLDOWN_MS) return NextResponse.json(generic);

    const user = await prisma.user.findUnique({ where: { email }, select: { email: true } });
    if (!user) return NextResponse.json(generic);

    const otp = String(randomInt(0, 1000000)).padStart(6, "0");
    await prisma.passwordReset.upsert({
        where: { email },
        update: { otpHash: await hash(otp, 10), resetTokenHash: null, expiresAt: new Date(Date.now() + WINDOW_MS), attempts: 0, verifiedAt: null, createdAt: new Date() },
        create: { email, otpHash: await hash(otp, 10), expiresAt: new Date(Date.now() + WINDOW_MS) },
    });
    await sendPasswordResetOtp(email, otp);
    return NextResponse.json(generic);
}
