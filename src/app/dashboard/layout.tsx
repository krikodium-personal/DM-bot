import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./layout.module.css";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span></span> DM Auto
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={`${styles.navLink} ${styles.activeNavLink}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Automations
                    </Link>
                </nav>

                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {session.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session.user?.name}</span>
                        <SignOutButton />
                    </div>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
