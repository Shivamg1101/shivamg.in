import { Header } from "@/components/header";
import { ScrollProgress } from "@/components/motion";
import { Footer } from "@/components/sections";
import { getProfile } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <ScrollProgress />
      <Header name={profile?.name ?? "Portfolio"} />
      <main id="main">{children}</main>
      {profile && <Footer profile={profile} />}
    </>
  );
}
