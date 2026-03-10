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
                url: `https://business.facebook.com/dialog/oauth?config_id=${process.env.FACEBOOK_CONFIG_ID}&response_type=code&override_default_response_type=1&login_options[0]=IG&cma_account_switch=1&is_ig_oidc_with_redirect=1&display=popup&ret=login&fbapp_pres=0&scope=instagram_manage_messages,instagram_manage_comments,pages_manage_metadata,pages_read_engagement,pages_show_list,public_profile`,
                params: {
                    scope: "instagram_manage_messages,instagram_manage_comments,pages_manage_metadata,pages_read_engagement,pages_show_list,public_profile"
                }
            },
            userinfo: {
                url: "https://graph.facebook.com/me?fields=id,name,picture",
            },
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.id + "@facebook.local", // Bypass NextAuth's email requirement since OIDC lacks email scope
                    image: profile.picture?.data?.url,
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
