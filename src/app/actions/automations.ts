"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAutomation(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const channel = await prisma.channel.findFirst({
        where: { userId: session.user.id },
    });

    if (!channel) {
        throw new Error("No Instagram Channel connected");
    }

    // Parse Form Data
    const keyword = formData.get("keyword") as string;
    const publicReply = formData.get("publicReply") as string;
    const initialDm = formData.get("initialDm") as string;
    const ctaLabel = formData.get("ctaLabel") as string;
    const linkUrl = formData.get("linkUrl") as string;

    if (!keyword || !publicReply || !initialDm || !ctaLabel || !linkUrl) {
        throw new Error("All fields are required");
    }

    // Create Automation
    await prisma.automation.create({
        data: {
            channelId: channel.id,
            triggerType: "ALL_POSTS",
            keyword,
            publicReply,
            initialDm,
            ctaLabel,
            linkUrl,
            status: "LIVE", // Activate on creation for MVP
        },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function toggleAutomationStatus(automationId: string, currentStatus: string) {
    const newStatus = currentStatus === "LIVE" ? "DISABLED" : "LIVE";

    await prisma.automation.update({
        where: { id: automationId },
        data: { status: newStatus },
    });

    revalidatePath("/dashboard");
}
