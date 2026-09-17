import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM;
const deliveryRecipient = "developer.void117@gmail.com";

function escapeHtml(value: string) {
    return value.replace(/[&<>'\"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] || character);
}

async function sendEmail(to: string, subject: string, html: string) {
    if (!resend || !from) {
        console.error("Email service is not configured.");
        return false;
    }
    try {
        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) {
            console.error("Email delivery failed:", error.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Email delivery failed:", error);
        return false;
    }
}

export function sendWelcomeEmail(email: string, name: string | null) {
    const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
    return sendEmail(
        deliveryRecipient,
        "Welcome to FocusFlow",
        `<p>${greeting}</p><p>A FocusFlow account has been created successfully for <strong>${escapeHtml(email)}</strong>.</p>`,
    );
}

export function sendPasswordResetOtp(email: string, otp: string) {
    return sendEmail(
        deliveryRecipient,
        "Your FocusFlow password reset code",
        `<p>Password reset requested for <strong>${escapeHtml(email)}</strong>.</p><p>Your password reset code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes.</p>`,
    );
}
