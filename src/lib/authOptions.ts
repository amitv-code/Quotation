
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface CustomUser extends NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "divine" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded admin credentials
        if (credentials?.username === "divine" && credentials?.password === "Amit503266") {
          // In a real app, you'd fetch user from DB and verify hashed password
          const user: CustomUser = { 
            id: "admin-user-001", // Static ID for the hardcoded user
            name: "Divine Admin", 
            email: "admin@example.com", // Placeholder email
            role: "admin" 
          };
          return user;
        }
        // If credentials do not match, return null to indicate failure
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user's role and id to the token right after signin
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user && token.sub) { // token.sub is the user id from JWT
        const customSessionUser = session.user as CustomUser;
        customSessionUser.id = token.sub; // Use token.sub as a default or fallback id
        if (token.id) customSessionUser.id = token.id as string;
        if (token.role) customSessionUser.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error', // (optional) custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
};
