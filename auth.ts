import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./lib/prisma";

class EmailNotRegisteredError extends CredentialsSignin {
  code = "EmailNotRegistered";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email || "")
          .toLowerCase()
          .trim();
        const password = String(credentials.password || "");
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        });
        if (!user) throw new EmailNotRegisteredError();
        if (!(await compare(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  logger: {
    error(code, ...message) {
      // Invalid credentials are expected user input, not an application failure.
      if ((code as { type?: string }).type === "CredentialsSignin") return;
      console.error(code, ...message);
    },
  },
});
