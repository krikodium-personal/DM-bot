"use client";

import { useState } from "react";
import { createAutomation } from "@/app/actions/automations";
import layoutStyles from "../../layout.module.css";
import styles from "./page.module.css";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NewAutomationPage() {
    const { data: session } = useSession();

    // Local state for the Live Simulator
    const [keyword, setKeyword] = useState("quiero just");
    const [initialDm, setInitialDm] = useState("Hi! Awesome, here is your exclusive link:");
    const [ctaLabel, setCtaLabel] = useState("Get the Link 🚀");
    const [linkUrl, setLinkUrl] = useState("https://yourstore.com/special");

    return (
        <>
            <div className={layoutStyles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link href="/dashboard" className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 className={layoutStyles.pageTitle}>Create Automation Flow</h1>
                </div>
            </div>

            <div className={styles.grid}>
                {/* BUILDER PANEL */}
                <div className={styles.builderPanel}>
                    <form action={createAutomation}>

                        {/* Step 1: The Trigger */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>1</span>
                                The Trigger (When this happens...)
                            </h2>

                            <div className={styles.formGroup}>
                                <label>User comments this exact keyword or phrase:</label>
                                <input
                                    type="text"
                                    name="keyword"
                                    required
                                    className={styles.input}
                                    placeholder="e.g. Price, Link, quiero just"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Public Reply (Auto-reply in the comments to confirm):</label>
                                <input
                                    type="text"
                                    name="publicReply"
                                    required
                                    className={styles.input}
                                    placeholder="e.g. Just sent you a DM! 📩"
                                    defaultValue="Just sent you a DM! 📩"
                                />
                            </div>
                        </div>

                        {/* Step 2: The DM Funnel */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNumber}>2</span>
                                The DM (Send this message...)
                            </h2>

                            <div className={styles.formGroup}>
                                <label>Initial Message Text:</label>
                                <textarea
                                    name="initialDm"
                                    required
                                    className={styles.input}
                                    placeholder="Hey, here is the information you requested..."
                                    value={initialDm}
                                    onChange={(e) => setInitialDm(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Interactive Button Text (CTA):</label>
                                <input
                                    type="text"
                                    name="ctaLabel"
                                    required
                                    className={styles.input}
                                    value={ctaLabel}
                                    onChange={(e) => setCtaLabel(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Target URL (Where the button sends them):</label>
                                <input
                                    type="url"
                                    name="linkUrl"
                                    required
                                    className={styles.input}
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submission */}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                            Save & Go Live 🚀
                        </button>
                    </form>
                </div>

                {/* SIMULATOR (LIVE PREVIEW) */}
                <div className={styles.simulatorContainer}>
                    <div className={styles.simulatorHeader}>
                        <h3 className={styles.simulatorTitle}>Live Preview</h3>
                        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>How it looks to your customer</p>
                    </div>

                    <div className={styles.phone}>
                        <div className={styles.igHeader}>
                            <div className={styles.igAvatar}></div>
                            <div className={styles.igName}>{session?.user?.name || "KrikoStore"}</div>
                        </div>

                        <div className={styles.chatArea}>
                            <div className={`${styles.message} ${styles.received}`}>
                                Hi! I commented "{keyword || "..."}" on your recent reel.
                            </div>

                            <div className={`${styles.message} ${styles.sent}`}>
                                <div>{initialDm || "..."}</div>
                                <div className={styles.ctaButton}>
                                    {ctaLabel || "Button Text"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
