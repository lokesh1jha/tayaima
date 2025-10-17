import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

export const authConfig = {
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
    Credentials({
      id: "phone-otp",
      name: "phone-otp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.phone || !credentials?.otp) return null;
        
        // Verify OTP
        const now = new Date();
        const otpRecord = await prisma.otpVerification.findFirst({
          where: {
            phone: credentials.phone,
            otp: credentials.otp,
            expiresAt: {
              gt: now,
            },
            verifiedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!otpRecord) return null;

        // Find user by phone
        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone,
          },
        });

        if (!user) return null;

        // Mark OTP as verified
        await prisma.otpVerification.update({
          where: {
            id: otpRecord.id,
          },
          data: {
            verifiedAt: now,
          },
        });

        // Update phone verification timestamp
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            phoneVerified: now,
          },
        });

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
    async jwt({ token, user }: any) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role ?? "USER";
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }: any) {
      try {
        if (session.user && token) {
          session.user.id = token.id;
          (session.user as any).role = token.role ?? "USER";
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const authOptions = authConfig;
export default authConfig;