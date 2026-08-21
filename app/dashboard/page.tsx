import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    return (
        <div style={{ padding: "3rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Dashboard</h1>
            <p>
                Welcome back, {session.user?.name} ({session.user?.role}). Lesson
                scheduling tools will live here.
            </p>
        </div>
    );
}
