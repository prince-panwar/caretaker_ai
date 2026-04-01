import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Validate inputs
        if (!email || !password) return null;
        if (password.length < 6) return null;

        // Stateless auth: any valid email + password (>= 6 chars) gets a session.
        // The JWT itself IS the user record — no database needed.
        // For production, add a real user store (Vercel KV, Planetscale, etc.)
        return {
          id: email,
          email: email,
          name: email.split("@")[0],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
