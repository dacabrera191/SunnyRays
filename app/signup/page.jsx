"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const SWIM_LEVELS = ["No experience", "Beginner", "Intermediate", "Advanced"];

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        parentName: "",
        email: "",
        phone: "",
        poolLocation: "",
        kids: [{ name: "", age: "", swimLevel: "" }],
    });

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateKid = (index, field, value) => {
        setForm((prev) => {
            const kids = [...prev.kids];
            kids[index] = { ...kids[index], [field]: value };
            return { ...prev, kids };
        });
    };

    const addKid = () => {
        setForm((prev) => ({
            ...prev,
            kids: [...prev.kids, { name: "", age: "", swimLevel: "" }],
        }));
    };

    const removeKid = (index) => {
        setForm((prev) => ({
            ...prev,
            kids: prev.kids.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={styles.page}>
                <div className={styles["success-card"]}>
                    <div className={styles["wave-icon"]}>🌊</div>
                    <h2>You're signed up!</h2>
                    <p>We'll be in touch soon with your lesson details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles["hero-bg"]} />
                <div className={styles["hero-content"]}>
                    <span className={styles.eyebrow}>Pool Lessons Registration</span>
                    <h1>Dive In</h1>
                    <p className={styles["hero-sub"]}>Sign up your family for the summer's best swim program.</p>
                </div>
                <div className={styles["wave-divider"]}>
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
                    </svg>
                </div>
            </div>

            <div className={styles["form-container"]}>
                <div className={styles["progress-bar"]}>
                    <div className={`${styles.pill} ${step >= 1 ? styles.active : ""}`}>1 · Parent Info</div>
                    <div className={styles.connector} />
                    <div className={`${styles.pill} ${step >= 2 ? styles.active : ""}`}>2 · Kids</div>
                </div>

                {step === 1 && (
                    <div className={`${styles.card} ${styles["animate-in"]}`}>
                        <h2 className={styles["section-title"]}>Your Information</h2>

                        <label>
                            <span>Full Name</span>
                            <input
                                type="text"
                                placeholder="Jane Smith"
                                value={form.parentName}
                                onChange={(e) => updateField("parentName", e.target.value)}
                            />
                        </label>

                        <label>
                            <span>Email Address</span>
                            <input
                                type="email"
                                placeholder="jane@example.com"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                        </label>

                        <label>
                            <span>Phone Number</span>
                            <input
                                type="tel"
                                placeholder="(407) 000-0000"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                            />
                        </label>

                        <label>
                            <span>Address</span>
                            <input
                                type="text"
                                placeholder=""
                                value={form.poolLocation}
                                onChange={(e) => updateField("poolLocation", e.target.value)}
                            />
                        </label>

                        <button
                            className={styles["btn-primary"]}
                            onClick={() => setStep(2)}
                            disabled={!form.parentName || !form.email || !form.phone || !form.poolLocation}
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className={`${styles.card} ${styles["animate-in"]}`}>
                        <h2 className={styles["section-title"]}>Kids' Details</h2>
                        <p className={styles["section-hint"]}>Add each child joining the program.</p>

                        {form.kids.map((kid, i) => (
                            <div key={i} className={styles["kid-block"]}>
                                <div className={styles["kid-header"]}>
                                    <span className={styles["kid-label"]}>Child {i + 1}</span>
                                    {form.kids.length > 1 && (
                                        <button className={styles["remove-btn"]} onClick={() => removeKid(i)}>✕ Remove</button>
                                    )}
                                </div>

                                <label>
                                    <span>Name</span>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={kid.name}
                                        onChange={(e) => updateKid(i, "name", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Age</span>
                                    <input
                                        type="number"
                                        placeholder="e.g. 7"
                                        min="1"
                                        max="18"
                                        value={kid.age}
                                        onChange={(e) => updateKid(i, "age", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Swim Level</span>
                                    <select
                                        value={kid.swimLevel}
                                        onChange={(e) => updateKid(i, "swimLevel", e.target.value)}
                                    >
                                        <option value="">Select a level…</option>
                                        {SWIM_LEVELS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        ))}

                        <button className={styles["btn-add"]} onClick={addKid}>+ Add Another Child</button>

                        {error && <p className={styles["error-msg"]}>{error}</p>}

                        <div className={styles["btn-row"]}>
                            <button className={styles["btn-back"]} onClick={() => setStep(1)}>← Back</button>
                            <button
                                className={styles["btn-primary"]}
                                onClick={handleSubmit}
                                disabled={
                                    submitting ||
                                    form.kids.some((k) => !k.name || !k.age || !k.swimLevel)
                                }
                            >
                                {submitting ? "Submitting…" : "Complete Sign Up"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}