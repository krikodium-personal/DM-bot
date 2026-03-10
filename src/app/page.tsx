"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="screen-height flex-center">
        <div className="animate-fade-in" style={{ opacity: 0.5 }}>Loading...</div>
      </main>
    );
  }

  return (
    <main className={styles.hero}>
      <div className={`container animate-fade-in`}>
        <div className={styles.badge}>
          <span></span> Instagram Automation MVP
        </div>

        <h1 className={styles.title}>
          Turn Comments into <br />
          <span className="text-gradient">Automated Sales</span>
        </h1>

        <p className={styles.subtitle}>
          Connect your Instagram Business account to automatically send DMs
          with your links whenever someone comments a specific keyword on your posts.
        </p>

        <div className={styles.actions}>
          <button
            className={styles.loginBtn}
            onClick={() => signIn("facebook")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
            </svg>
            Conectar con Meta
          </button>

          <button className="btn btn-secondary">
            View Live Demo
          </button>
        </div>

        <div className={styles.mockupContainer}>
          <div className={styles.mockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
            <div className={styles.mockupBody}>
              <div className={`${styles.chatBubble} ${styles.received}`}>
                @krikodium: quiero just ✨
              </div>
              <div className={`${styles.chatBubble} ${styles.sent}`}>
                Hi! Awesome, here is your exclusive link: https://swissjust.com/promo
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
