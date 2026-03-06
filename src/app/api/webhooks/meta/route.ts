import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

export async function GET(req: Request) {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.object === "instagram") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === "comments") {
                        const commentToken = change.value;
                        await handleComment(commentToken);
                    }
                }
            }
        }

        return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

async function handleComment(commentData: any) {
    if (!commentData.from || !commentData.from.id) return;

    const commenterId = commentData.from.id; // IGSID
    const text = commentData.text.toLowerCase();

    // Wait, how do we know which channel received this? 
    // We can look up the media's owner or just grab all LIVE automations for the MVP
    const automations = await prisma.automation.findMany({
        where: { status: "LIVE" },
        include: { channel: true },
    });

    // Find matching automation
    const matchedAutomation = automations.find((a) => text.includes(a.keyword.toLowerCase()));

    if (matchedAutomation) {
        console.log(`Keyword matched for automation ${matchedAutomation.id}! Sending DM...`);

        // Increment Sends Metric
        await prisma.automation.update({
            where: { id: matchedAutomation.id },
            data: { sends: { increment: 1 } },
        });

        const redirectUrl = `${process.env.NEXTAUTH_URL}/api/redirect?a=${matchedAutomation.id}`;

        // We send public reply (mocked/omitted for simplicity if we only want DM)
        // Actually sending the DM:
        await sendGraphApiDm(
            commenterId,
            matchedAutomation.channel.pageAccessToken,
            matchedAutomation.initialDm,
            matchedAutomation.ctaLabel,
            redirectUrl
        );
    }
}

async function sendGraphApiDm(recipientId: string, pageToken: string, text: string, buttonLabel: string, url: string) {
    const payload = {
        recipient: { id: recipientId },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: text,
                    buttons: [
                        {
                            type: "web_url",
                            url: url,
                            title: buttonLabel,
                        }
                    ]
                }
            }
        }
    };

    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.error) {
            console.error("Graph API Error:", data.error);
        }
    } catch (err) {
        console.error("Failed to send graph API DM:", err);
    }
}
