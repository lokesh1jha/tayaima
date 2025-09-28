import NextAuth from "next-auth";
import authConfig from "@/lib/auth";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// Add error handling for development
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth configuration loaded:', {
    providers: authConfig.providers.map(p => p.id),
    session: authConfig.session,
    pages: authConfig.pages,
  });
}