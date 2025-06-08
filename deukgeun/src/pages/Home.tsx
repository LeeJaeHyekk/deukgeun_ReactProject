import { HeroSection } from "@widgets/HeroSection";
import { ServiceIntro } from "@widgets/ServiceIntro";
import { CommunityPreview } from "@widgets/CommunityPreview";
import { MachineGuideSection } from "@widgets/MachineGuideSection";
import { CallToAction } from "@widgets/CallToAction";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <HeroSection />
      <ServiceIntro />
      <CommunityPreview />
      <MachineGuideSection />
      <CallToAction />
    </main>
  );
}