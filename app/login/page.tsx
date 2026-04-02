"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SWIM_LEVELS = ["No experience", "Beginner", "Intermediate", "Advanced"];

interface Kid {
    name: string;
    age: string;
    swimLevel: string;
}

interface FormData {
    parentName: string;
    email: string;
    phone: string;
    poolLocation: string;
    kids: Kid[];
}

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState < FormData > ({
        parentName: "",
        email: "",
        phone: "",
        poolLocation: "",
        kids: [{ name: "", age: "", swimLevel: "" }],
    });

    const updateField = (field: keyof Omit<FormData, "kids">, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateKid = (index: number, field: keyof Kid, value: string) => {
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

    const removeKid = (index: number) => {
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="page">
                <div className="success-card">
                    <div className="wave-icon">🌊</div>
                    <h2>You're signed up!</h2>
                    <p>We'll be in touch soon with your lesson details.</p>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="hero">
                <div className="hero-bg" />
                <div className="hero-content">
                    <span className="eyebrow">Pool Lessons Registration</span>
                    <h1>Dive In</h1>
                    <p className="hero-sub">Sign up your family for the summer's best swim program.</p>
                </div>
                <div className="wave-divider">
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--cream)" />
                    </svg>
                </div>
            </div>

            <div className="form-container">
                <div className="progress-bar">
                    <div className={`pill ${step >= 1 ? "active" : ""}`}>1 · Parent Info</div>
                    <div className="connector" />
                    <div className={`pill ${step >= 2 ? "active" : ""}`}>2 · Kids</div>
                </div>

                {step === 1 && (
                    <div className="card animate-in">
                        <h2 className="section-title">Your Information</h2>

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
                                placeholder="(555) 000-0000"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                            />
                        </label>

                        <label>
                            <span>Pool Location</span>
                            <input
                                type="text"
                                placeholder="Westside Community Pool"
                                value={form.poolLocation}
                                onChange={(e) => updateField("poolLocation", e.target.value)}
                            />
                        </label>

                        <button
                            className="btn-primary"
                            onClick={() => setStep(2)}
                            disabled={!form.parentName || !form.email || !form.phone || !form.poolLocation}
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="card animate-in">
                        <h2 className="section-title">Kids' Details</h2>
                        <p className="section-hint">Add each child joining the program.</p>

                        {form.kids.map((kid, i) => (
                            <div key={i} className="kid-block">
                                <div className="kid-header">
                                    <span className="kid-label">Child {i + 1}</span>
                                    {form.kids.length > 1 && (
                                        <button className="remove-btn" onClick={() => removeKid(i)}>✕ Remove</button>
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

                        <button className="btn-add" onClick={addKid}>+ Add Another Child</button>

                        {error && <p className="error-msg">{error}</p>}

                        <div className="btn-row">
                            <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                            <button
                                className="btn-primary"
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

            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --ocean: #0e6e8c;
    --ocean-dark: #094f66;
    --sky: #b8e4f2;
    --foam: #e8f7fc;
    --cream: #faf8f4;
    --sand: #e8dcc8;
    --text: #1a2e38;
    --muted: #5c7a87;
    --radius: 16px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
  }

  /* Hero */
  .hero {
    position: relative;
    background: linear-gradient(135deg, var(--ocean-dark) 0%, var(--ocean) 50%, #1a9abf 100%);
    padding: 80px 24px 100px;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%);
  }
  .hero-content {
    position: relative;
    max-width: 560px;
    margin: 0 auto;
    text-align: center;
  }
  .eyebrow {
    display: inline-block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--sky);
    margin-bottom: 16px;
    border: 1px solid rgba(184,228,242,0.35);
    padding: 5px 14px;
    border-radius: 100px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(56px, 10vw, 88px);
    font-weight: 900;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .hero-sub {
    margin-top: 16px;
    color: rgba(255,255,255,0.75);
    font-size: 17px;
    font-weight: 300;
    line-height: 1.6;
  }
  .wave-divider {
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 80px;
  }
  .wave-divider svg { width: 100%; height: 100%; }

  /* Form area */
  .form-container {
    max-width: 560px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* Progress */
  .progress-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 32px;
    justify-content: center;
  }
  .pill {
    font-size: 13px;
    font-weight: 500;
    padding: 6px 16px;
    border-radius: 100px;
    border: 1.5px solid var(--sand);
    color: var(--muted);
    transition: all 0.25s ease;
  }
  .pill.active {
    background: var(--ocean);
    border-color: var(--ocean);
    color: #fff;
  }
  .connector {
    flex: 1;
    max-width: 48px;
    height: 1.5px;
    background: var(--sand);
  }

  /* Card */
  .card {
    background: #fff;
    border-radius: var(--radius);
    padding: 36px;
    box-shadow: 0 2px 24px rgba(14,110,140,0.08), 0 1px 4px rgba(0,0,0,0.04);
    border: 1px solid rgba(232,220,200,0.5);
  }
  .animate-in {
    animation: fadeUp 0.35s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--ocean-dark);
    margin-bottom: 6px;
  }
  .section-hint {
    color: var(--muted);
    font-size: 14px;
    margin-bottom: 24px;
  }

  /* Labels & Inputs */
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
  }
  label span {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  input, select {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--text);
    background: var(--foam);
    border: 1.5px solid var(--sky);
    border-radius: 10px;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    appearance: none;
  }
  input:focus, select:focus {
    border-color: var(--ocean);
    box-shadow: 0 0 0 3px rgba(14,110,140,0.12);
    background: #fff;
  }
  input::placeholder { color: #aac4cf; }

  /* Kid blocks */
  .kid-block {
    background: var(--foam);
    border: 1px solid var(--sky);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .kid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .kid-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--ocean);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #c0392b;
    font-family: 'DM Sans', sans-serif;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .remove-btn:hover { background: rgba(192,57,43,0.08); }
  .kid-block label span { color: var(--muted); }
  .kid-block input, .kid-block select { background: #fff; }

  /* Buttons */
  .btn-primary {
    width: 100%;
    margin-top: 8px;
    padding: 14px;
    background: var(--ocean);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(14,110,140,0.3);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--ocean-dark);
    box-shadow: 0 6px 20px rgba(14,110,140,0.4);
    transform: translateY(-1px);
  }
  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }
  .btn-add {
    width: 100%;
    padding: 12px;
    background: transparent;
    color: var(--ocean);
    border: 1.5px dashed var(--sky);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 24px;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-add:hover { background: var(--foam); border-color: var(--ocean); }
  .btn-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
  .btn-back {
    flex: 0 0 auto;
    padding: 14px 20px;
    background: transparent;
    color: var(--muted);
    border: 1.5px solid var(--sand);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-back:hover { border-color: var(--ocean); color: var(--ocean); }
  .btn-row .btn-primary { flex: 1; margin-top: 0; }

  /* Error */
  .error-msg {
    background: #fef0ee;
    border: 1px solid #f5c6c0;
    color: #c0392b;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    margin-bottom: 12px;
  }

  /* Success */
  .success-card {
    max-width: 480px;
    margin: 120px auto;
    background: #fff;
    border-radius: var(--radius);
    padding: 56px 40px;
    text-align: center;
    box-shadow: 0 2px 32px rgba(14,110,140,0.1);
    animation: fadeUp 0.4s ease both;
  }
  .wave-icon { font-size: 56px; margin-bottom: 20px; }
  .success-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    color: var(--ocean-dark);
    margin-bottom: 12px;
  }
  .success-card p { color: var(--muted); font-size: 16px; line-height: 1.6; }
`;
