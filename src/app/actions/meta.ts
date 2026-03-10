"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function connectInstagramChannel(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const igId = formData.get("igId") as string;
    const username = formData.get("username") as string;
    const pageAccessToken = formData.get("pageAccessToken") as string;

    if (!igId || !username || !pageAccessToken) {
        throw new Error("Missing required fields");
    }

    // Create or Update the Channel
    await prisma.channel.upsert({
        where: { instagramId: igId },
        update: {
            name: username,
            pageAccessToken: pageAccessToken,
            userId: session.user.id,
        },
        create: {
            instagramId: igId,
            name: username,
            pageAccessToken: pageAccessToken,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard");
}
