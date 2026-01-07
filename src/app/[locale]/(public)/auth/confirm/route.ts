
import { redirect } from "@/src/i18n/navigation";
import { type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  // OAuth callback route removed - Supabase no longer in use
  redirect({ href: `/auth/error?error=Authentication provider not configured`, locale });
}
