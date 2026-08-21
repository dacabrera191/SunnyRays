"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import type { StaffPayload } from "@/types/staff";

const initialForm: StaffPayload = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "instructor",
};

export default function AdminStaffPage() {
    const [form, setForm] = useState<StaffPayload>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const updateField = (field: keyof StaffPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/admin/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not create account");

            setSuccess(`Account created for ${form.email}.`);
            setForm(initialForm);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-12">
            <h1 className="font-lora text-3xl font-semibold text-ink mb-6">
                Create Instructor / Admin Account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                    <span className="text-sm font-bold text-ink-muted">Name</span>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="mt-1 w-full rounded-md border border-sky/40 bg-surface px-3 py-2 text-ink"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-bold text-ink-muted">Email</span>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="mt-1 w-full rounded-md border border-sky/40 bg-surface px-3 py-2 text-ink"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-bold text-ink-muted">Phone</span>
                    <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="mt-1 w-full rounded-md border border-sky/40 bg-surface px-3 py-2 text-ink"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-bold text-ink-muted">Temporary Password</span>
                    <input
                        type="password"
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="mt-1 w-full rounded-md border border-sky/40 bg-surface px-3 py-2 text-ink"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-bold text-ink-muted">Role</span>
                    <select
                        value={form.role}
                        onChange={(e) => updateField("role", e.target.value)}
                        className="mt-1 w-full rounded-md border border-sky/40 bg-surface px-3 py-2 text-ink"
                    >
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-700 text-sm">{success}</p>}

                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Creating…" : "Create Account"}
                </Button>
            </form>
        </div>
    );
}
