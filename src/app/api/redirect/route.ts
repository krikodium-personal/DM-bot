import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const automationId = url.searchParams.get("a");

    if (!automationId) {
        return new NextResponse("Invalid request", { status: 400 });
    }

    try {
        const automation = await prisma.automation.findUnique({
            where: { id: automationId },
        });

        if (automation) {
            // Increment clicks
            await prisma.automation.update({
                where: { id: automationId },
                data: { clicks: { increment: 1 } },
            });

            // Redirect user to actual target URL
            return NextResponse.redirect(automation.linkUrl);
        }

        return new NextResponse("Automation not found", { status: 404 });
    } catch (error) {
        console.error("Redirect error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
