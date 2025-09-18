import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "email-password",
      name: "Email & Password",
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
          phone: user.phone,
          name: user.name,
          image: user.image ?? undefined,
          role: user.role,
        } as any;
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone & OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.phone || !credentials?.otp) return null;
        
        // Import OTP utilities
        const { validatePhoneNumber, normalizePhoneNumber, isOTPExpired } = await import("@/lib/otp");
        
        if (!validatePhoneNumber(credentials.phone)) return null;
        
        const normalizedPhone = normalizePhoneNumber(credentials.phone);
        const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
        
        if (!user?.phoneOtp) return null;
        if (user.phoneOtp !== credentials.otp) return null;
        if (!user.phoneOtpExpiry || isOTPExpired(user.phoneOtpExpiry)) return null;
        
        // Clear OTP after successful verification
        await prisma.user.update({
          where: { id: user.id },
          data: {
            phoneOtp: null,
            phoneOtpExpiry: null,
            phoneVerified: user.phoneVerified || new Date(),
          }
        });
        
        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          image: user.image ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        // First time JWT callback is run, user object is available
        token.role = (user as any).role ?? "USER";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = (token.sub as string) || ((token as any).id as string);
        (session.user as any).role = (token as any).role ?? "USER";
      }
      return session;
    },
  },
};

export const authOptions = authConfig;
export default authConfig;