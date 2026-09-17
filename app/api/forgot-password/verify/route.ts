import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

const MAX_ATTEMPTS = 5;

function digest(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const otp = String(body.otp || "");
    const reset = await prisma.passwordReset.findUnique({ where: { email } });
    if (!reset || reset.verifiedAt || reset.expiresAt < new Date() || reset.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
    }
    const valid = /^\d{6}$/.test(otp) && (await compare(otp, reset.otpHash));
    if (!valid) {
        await prisma.passwordReset.update({ where: { email }, data: { attempts: { increment: 1 } } });
        return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
    }
    const token = randomBytes(32).toString("hex");
    await prisma.passwordReset.update({ where: { email }, data: { verifiedAt: new Date(), resetTokenHash: digest(token) } });
    return NextResponse.json({ resetToken: token });
}
