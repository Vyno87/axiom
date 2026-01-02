import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Hardcoded Admin for now (replace with DB logic later if needed)
                if (
                    credentials?.username === "admin" &&
                    credentials?.password === "admin123"
                ) {
                    return { id: "1", name: "Admin System", email: "admin@axiom.id", role: "admin" };
                }

                // Demo User
                if (
                    credentials?.username === "user" &&
                    credentials?.password === "user123"
                ) {
                    return { id: "2", name: "Demo Employee", email: "user@axiom.id", role: "user" };
                }

                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "very_secret_key_axiom_2026",
};
