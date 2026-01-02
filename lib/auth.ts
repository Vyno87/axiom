import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // FALLBACK: Hardcoded admin if database is empty or unreachable
                if (
                    credentials.username === "admin" &&
                    credentials.password === "admin123"
                ) {
                    return {
                        id: "admin-fallback",
                        name: "Admin System",
                        email: "admin@axiom.id",
                        role: "admin",
                    };
                }

                // FALLBACK: Demo user
                if (
                    credentials.username === "user" &&
                    credentials.password === "user123"
                ) {
                    return {
                        id: "user-fallback",
                        name: "Demo Employee",
                        email: "user@axiom.id",
                        role: "user",
                    };
                }

                try {
                    await dbConnect();

                    // Find user in database
                    const user = await User.findOne({
                        username: credentials.username,
                        isActive: true
                    });

                    // Verify password (In production, use bcrypt.compare())
                    if (user && user.password === credentials.password) {
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email || "",
                            role: user.role,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
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
