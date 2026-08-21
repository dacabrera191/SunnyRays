import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function AdminPage() {
    const session = await auth();
    if (!session) redirect("/login");
    if (session.user?.role !== "admin") redirect("/dashboard");

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="font-lora text-3xl font-semibold text-ink mb-6">Admin</h1>
            <ul className="space-y-3">
                <li>
                    <Link href="/admin/staff" className="text-primary font-bold hover:text-primary-hover">
                        Create an instructor or admin account
                    </Link>
                </li>
            </ul>
        </div>
    );
}
