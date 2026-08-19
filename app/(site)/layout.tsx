import { Header } from "@/components/header";
import { ScrollProgress } from "@/components/motion";
import { Footer } from "@/components/sections";
import { PersonSchema, WebSiteSchema } from "@/components/structured-data";
import { getExperience, getProfile } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, experience] = await Promise.all([getProfile(), getExperience()]);

  return (
    <>
      {profile && <PersonSchema profile={profile} experience={experience} />}
      <WebSiteSchema />
      <ScrollProgress />
      <Header name={profile?.name ?? "Portfolio"} />
      <main id="main">{children}</main>
      {profile && <Footer profile={profile} />}
    </>
  );
}
