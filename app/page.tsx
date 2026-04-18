import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";
import { Clients } from "@/components/sections/clients";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <Clients />
    </>
  );
}
