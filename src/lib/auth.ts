import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { compare } from "bcryptjs";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) return null;
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        // Include role so JWT callback can set token.role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First time JWT callback is run, user object is available
        token.role = (user as any).role ?? "USER";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || ((token as any).id as string);
        (session.user as any).role = (token as any).role ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const authOptions = authConfig;
export default authConfig;