"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
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

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    background: var(--color-bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--color-text);
  }

  /* Hero */
  .hero {
    position: relative;
    background: linear-gradient(135deg, var(--sr-navy-deep) 0%, var(--sr-navy) 45%, var(--sr-ocean) 100%);
    padding: 80px 24px 100px;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(245,197,24,0.10) 0%, transparent 55%);
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
    color: var(--sr-sun);
    margin-bottom: 16px;
    border: 1px solid rgba(245,197,24,0.4);
    padding: 5px 14px;
    border-radius: 100px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(56px, 10vw, 88px);
    font-weight: 900;
    color: var(--color-text-inverse);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .hero-sub {
    margin-top: 16px;
    color: rgba(255,255,255,0.8);
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
    border: 1.5px solid var(--color-border);
    color: var(--color-text-muted);
    transition: all 0.25s ease;
    background: var(--color-surface);
  }
  .pill.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-primary-contrast);
  }
  .connector {
    flex: 1;
    max-width: 48px;
    height: 1.5px;
    background: var(--color-border);
  }

  /* Card */
  .card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 36px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
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
    color: var(--sr-navy);
    margin-bottom: 6px;
  }
  .section-hint {
    color: var(--color-text-muted);
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
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  input, select {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--color-text);
    background: var(--sr-mist);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    width: 100%;
    appearance: none;
  }
  input:focus, select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(31,132,176,0.15);
    background: var(--color-surface);
  }
  input::placeholder { color: var(--color-text-muted); opacity: 0.6; }

  /* Kid blocks */
  .kid-block {
    background: var(--sr-mist);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
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
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--color-danger);
    font-family: 'DM Sans', sans-serif;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .remove-btn:hover { background: rgba(217,75,75,0.08); }
  .kid-block label span { color: var(--color-text-muted); }
  .kid-block input, .kid-block select { background: var(--color-surface); }

  /* Buttons */
  .btn-primary {
    width: 100%;
    margin-top: 8px;
    padding: 14px;
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    border: none;
    border-radius: var(--radius-md);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(31,132,176,0.3);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
    box-shadow: 0 6px 20px rgba(31,132,176,0.4);
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
    color: var(--color-primary);
    border: 1.5px dashed var(--sr-sky);
    border-radius: var(--radius-md);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 24px;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-add:hover { background: var(--sr-mist); border-color: var(--color-primary); }
  .btn-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
  .btn-back {
    flex: 0 0 auto;
    padding: 14px 20px;
    background: transparent;
    color: var(--color-text-muted);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-back:hover { border-color: var(--color-primary); color: var(--color-primary); }
  .btn-row .btn-primary { flex: 1; margin-top: 0; }

  /* Error */
  .error-msg {
    background: rgba(217,75,75,0.08);
    border: 1px solid rgba(217,75,75,0.3);
    color: var(--color-danger);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-size: 14px;
    margin-bottom: 12px;
  }

  /* Success */
  .success-card {
    max-width: 480px;
    margin: 120px auto;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 56px 40px;
    text-align: center;
    box-shadow: var(--shadow-lg);
    animation: fadeUp 0.4s ease both;
  }
  .wave-icon { font-size: 56px; margin-bottom: 20px; }
  .success-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    color: var(--sr-navy);
    margin-bottom: 12px;
  }
  .success-card p { color: var(--color-text-muted); font-size: 16px; line-height: 1.6; }
`;