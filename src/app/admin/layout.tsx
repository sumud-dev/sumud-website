import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get claims to verify user is authenticated
  const { data, error } = await supabase.auth.getClaims();

  // If no claims or error, redirect to login
  if (error || !data?.claims) {
    redirect("/auth/login?redirectTo=/admin");
  }

  // Get user info for display
  const userEmail = data.claims.email as string | undefined;
  const userInitial = userEmail ? userEmail[0].toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userEmail={userEmail} userInitial={userInitial} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6">
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
