import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import LanguageSwitcher from "@/src/components/ui/language-switcher";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user is authenticated
  const authObj = await auth();
  if (!authObj.userId) {
    redirect(`/sign-in?redirect_url=/admin`);
  }

  // Get user info for display
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : (lastName ? lastName.charAt(0).toUpperCase() : "U");

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userEmail={userEmail} userInitial={userInitial} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6">
          <div className="flex-1" />
          <LanguageSwitcher variant="compact" />
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
