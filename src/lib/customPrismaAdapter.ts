import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";
import type { AdapterUser, AdapterAccount } from "next-auth/adapters";

/**
 * Custom Prisma Adapter that works with JWT strategy and doesn't require Session table
 * Based on @next-auth/prisma-adapter but removes session-related methods
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    // User management
    async createUser(user: Omit<AdapterUser, "id">) {
      return await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        },
      });
    },

    async getUser(id) {
      return await prisma.user.findUnique({
        where: { id },
      });
    },

    async getUserByEmail(email) {
      return await prisma.user.findUnique({
        where: { email },
      });
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        select: { user: true },
      });
      return account?.user ?? null;
    },

    async updateUser({ id, ...data }) {
      return await prisma.user.update({
        where: { id },
        data,
      });
    },

    async deleteUser(userId) {
      return await prisma.user.delete({
        where: { id: userId },
      });
    },

    // Account management (for OAuth providers)
    async linkAccount(account: AdapterAccount) {
      return await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      return await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    // Verification tokens (for email verification)
    async createVerificationToken({ identifier, expires, token }) {
      return await prisma.verificationToken.create({
        data: {
          identifier,
          expires,
          token,
        },
      });
    },

    async useVerificationToken({ identifier, token }) {
      try {
        return await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });
      } catch (error) {
        // If token doesn't exist, return null
        return null;
      }
    },

    // Session methods - NOT IMPLEMENTED (JWT strategy doesn't need them)
    // These are intentionally left undefined since we're using JWT strategy
    createSession: undefined,
    getSessionAndUser: undefined,
    updateSession: undefined,
    deleteSession: undefined,
  };
}
