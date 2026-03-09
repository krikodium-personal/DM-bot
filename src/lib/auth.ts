import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        {
            id: "instagram",
            name: "Instagram Business",
            type: "oauth",
            version: "2.0",
            clientId: process.env.INSTAGRAM_CLIENT_ID,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
            authorization: {
                url: "https://www.instagram.com/oauth/authorize",
                params: {
                    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
                    response_type: "code",
                    force_reauth: "true",
                }
            },
            token: {
                url: "https://api.instagram.com/oauth/access_token",
                async request(context) {
                    const response = await fetch("https://api.instagram.com/oauth/access_token", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            client_id: context.provider.clientId as string,
                            client_secret: context.provider.clientSecret as string,
                            grant_type: "authorization_code",
                            redirect_uri: context.provider.callbackUrl,
                            code: context.params.code as string,
                        }),
                    });
                    const tokens = await response.json();
                    if (!response.ok) throw tokens;
                    
                    // Immediately exchange for long-lived token
                    try {
                        const llResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${context.provider.clientSecret}&access_token=${tokens.access_token}`);
                        const llTokens = await llResponse.json();
                        if (llResponse.ok && llTokens.access_token) {
                            return { tokens: { access_token: llTokens.access_token, token_type: llTokens.token_type || tokens.token_type } };
                        }
                    } catch (e) {
                        console.error("Failed to exchange for long-lived token:", e);
                    }

                    return { tokens };
                }
            },
            userinfo: {
                url: "https://graph.instagram.com/v22.0/me?fields=id,username,profile_picture_url",
                async request({ tokens, provider }) {
                    const res = await fetch(`https://graph.instagram.com/v22.0/me?fields=id,username,profile_picture_url&access_token=${tokens.access_token}`);
                    const json = await res.json();
                    return json;
                }
            },
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.username + "@instagram.local", // NextAuth requires an email string
                    image: profile.profile_picture_url,
                }
            }
        }
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
