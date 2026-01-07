import MainHeader from "@/src/components/navigation/main-header";
import Footer from "@/src/components/navigation/footer";
import { type Locale } from "@/src/actions/navigation.actions";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1">{children}</main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
