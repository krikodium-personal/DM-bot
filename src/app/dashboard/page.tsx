import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connectInstagramChannel } from "@/app/actions/meta";
import layoutStyles from "./layout.module.css";
import styles from "./page.module.css";
import Link from "next/link";

async function getAvailableInstagramAccounts(userId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: "instagram" },
    });

    if (!account?.access_token) return { accounts: [], error: "No Instagram access token found in database for this user." };

    try {
        const res = await fetch(
            `https://graph.instagram.com/v22.0/me?fields=id,username,profile_picture_url&access_token=${account.access_token}`
        );
        const data = await res.json();
        
        if (data.error) {
            return { accounts: [], error: `Instagram API Error: ${data.error.message}`, debug: data.error };
        }

        // The user directly authorized their Instagram account, so we just return it
        const igAccounts = [{
            pageId: "direct-ig", // No longer tied to a specific Facebook Page ID in this context
            pageName: "Direct Connection",
            pageAccessToken: account.access_token, // We use the user's IG token
            igId: data.id,
            igUsername: data.username,
            igProfilePic: data.profile_picture_url || "",
        }];

        return { accounts: igAccounts };
    } catch (error: any) {
        console.error("Error fetching Instagram assets:", error);
        return { accounts: [], error: error.message || "Unknown error occurred while fetching your Instagram account." };
    }
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // 1. Get connected channels
    const channels = await prisma.channel.findMany({
        where: { userId: session!.user.id },
    });

    // 2. If no channels, show the asset selector
    if (channels.length === 0) {
        const { accounts: availableAccounts, error, debug } = await getAvailableInstagramAccounts(session!.user.id);

        return (
            <div className={layoutStyles.pageHeader}>
                <h1 className={layoutStyles.pageTitle}>Connect Your Instagram</h1>
                <p className={layoutStyles.pageSubtitle}>
                    Select the Instagram Professional account you want to automate.
                </p>

                <div className={styles.accountsGrid}>
                    {error && (
                        <div className={layoutStyles.glassCard} style={{ gridColumn: "1 / -1", borderLeft: "4px solid var(--accent-primary)" }}>
                            <h3 style={{ color: "var(--accent-primary)", marginBottom: "8px" }}>Diagnostic Check</h3>
                            <p style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#ffa07a", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "4px" }}>
                                {error}
                            </p>
                            {debug && (
                                <pre style={{ marginTop: "10px", fontSize: "0.7rem", overflowX: "auto", background: "#111", padding: "10px", borderRadius: "4px" }}>
                                    {JSON.stringify(debug, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}

                    {availableAccounts.length === 0 ? (
                        <div className={layoutStyles.glassCard} style={{ gridColumn: "1 / -1" }}>
                            <p>No Instagram Business accounts available to connect.</p>
                            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                Make sure your Instagram is a Professional/Business account and is explicitly linked to a Facebook Page you manage.
                            </p>
                        </div>
                    ) : (
                        availableAccounts.map((acc) => (
                            <form key={acc.igId} action={connectInstagramChannel} className={layoutStyles.glassCard}>
                                <input type="hidden" name="igId" value={acc.igId} />
                                <input type="hidden" name="username" value={acc.igUsername} />
                                <input type="hidden" name="pageAccessToken" value={acc.pageAccessToken} />

                                <div className={styles.accountCard}>
                                    {acc.igProfilePic ? (
                                        <img src={acc.igProfilePic} alt={acc.igUsername} className={styles.accountAvatar} />
                                    ) : (
                                        <div className={styles.accountAvatarFallback}>{acc.igUsername.charAt(0)}</div>
                                    )}
                                    <div className={styles.accountDetails}>
                                        <h3>@{acc.igUsername}</h3>
                                        <p>Direct Instagram Connection</p>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ marginLeft: "auto" }}>
                                        Connect
                                    </button>
                                </div>
                            </form>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // 3. User has connected channels, show overview
    const activeChannel = await prisma.channel.findUnique({
        where: { id: channels[0].id },
        include: { automations: { orderBy: { createdAt: 'desc' } } }
    });

    if (!activeChannel) return null;

    return (
        <>
            <div className={layoutStyles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={layoutStyles.pageTitle}>Automations</h1>
                    <p className={layoutStyles.pageSubtitle}>
                        Managing DMs for <span className="text-gradient">@{activeChannel.name}</span>
                    </p>
                </div>
                <Link href="/dashboard/automations/new" className="btn btn-primary">
                    + New Automation
                </Link>
            </div>

            {activeChannel.automations.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🚀</div>
                    <h2>No automations yet</h2>
                    <p>Create your first trigger to start sending automated DMs when people comment on your posts.</p>
                    <Link href="/dashboard/automations/new" className="btn btn-primary" style={{ marginTop: '24px' }}>
                        + Create Automation
                    </Link>
                </div>
            ) : (
                <div className={styles.accountsGrid}>
                    {activeChannel.automations.map((auto: any) => (
                        <div key={auto.id} className={layoutStyles.glassCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Keyword: <span style={{ color: 'var(--accent-primary)' }}>"{auto.keyword}"</span></h3>
                                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Sends: "{auto.initialDm.substring(0, 40)}..."</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{auto.sends}</span>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DMs Sent</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{auto.clicks}</span>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Link Clicks</p>
                                    </div>
                                </div>
                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: auto.status === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: auto.status === 'LIVE' ? 'var(--success)' : 'inherit' }}>
                                    {auto.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
