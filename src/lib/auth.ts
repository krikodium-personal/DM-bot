import { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        FacebookProvider({
            clientId: process.env.APP_ID as string,
            clientSecret: process.env.APP_SECRET as string,
            authorization: {
                url: "https://www.facebook.com/v19.0/dialog/oauth",
                params: {
                    config_id: process.env.FACEBOOK_CONFIG_ID,
                    response_type: "code",
                    override_default_response_type: "true",
                    prompt: "select_account",
                }
            }
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
