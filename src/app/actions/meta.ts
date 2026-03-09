"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function connectInstagramChannel(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const igId = formData.get('igId') as string;
    const username = formData.get('username') as string;
    const userToken = formData.get('pageAccessToken') as string; // Reusing this variable name for the IG token for minimal changes

    // Verify token exists via DB since we just authenticated it
    const account = await prisma.account.findFirst({
        where: { userId: session.user.id, provider: "instagram" },
    });

    if (!account?.access_token) {
        throw new Error("Missing Instagram auth token");
    }

    // Save channel info directly
    await prisma.channel.create({
        data: {
            userId: session.user.id,
            platform: "instagram",
            platformId: igId,
            name: username,
            accessToken: account.access_token,
        }
    });

    // TODO: Direct Instagram Webhook configuration requires registering the IG token at the App-level dashboard 
    // instead of individual Page-subscriptions. (This logic might be handled by Meta automatically via app config)

    revalidatePath('/dashboard');
    redirect('/dashboard');
}
