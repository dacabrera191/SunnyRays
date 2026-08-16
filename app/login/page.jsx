"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            // Successful login — adjust the destination as needed
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && form.email && form.password && !submitting) {
            handleSubmit();
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles["hero-bg"]} />
                <div className={styles["hero-content"]}>
                    <span className={styles.eyebrow}>Welcome Back</span>
                    <h1>Log In</h1>
                    <p className={styles["hero-sub"]}>Sign in to manage your family's swim lessons.</p>
                </div>
                <div className={styles["wave-divider"]}>
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
                    </svg>
                </div>
            </div>

            <div className={styles["form-container"]}>
                <div className={`${styles.card} ${styles["animate-in"]}`}>
                    <h2 className={styles["section-title"]}>Sign In</h2>

                    <label>
                        <span>Email Address</span>
                        <input
                            type="email"
                            placeholder="jane@example.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={form.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </label>

                    {error && <p className={styles["error-msg"]}>{error}</p>}

                    <button
                        className={styles["btn-primary"]}
                        onClick={handleSubmit}
                        disabled={submitting || !form.email || !form.password}
                    >
                        {submitting ? "Signing in…" : "Log In"}
                    </button>
                </div>

                <p className={styles["auth-link"]}>
                    Don't have an account? <Link href="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}