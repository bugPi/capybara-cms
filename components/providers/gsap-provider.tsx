"use client";

import "@/lib/gsap-register";
import { useLayoutEffect, type ReactNode } from "react";
import gsap from "gsap";

export function GsapProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    gsap.config({ nullTargetWarn: false });
    gsap.defaults({ ease: "power3.out", duration: 0.75 });
  }, []);

  return children;
}
