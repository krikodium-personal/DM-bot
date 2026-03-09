"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: 0,
                marginTop: "4px",
                textDecoration: "underline",
                textAlign: "left"
            }}
        >
            Disconnect Facebook
        </button>
    );
}
