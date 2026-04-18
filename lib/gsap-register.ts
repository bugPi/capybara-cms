import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** 必须在任何使用 scrollTrigger 的 GSAP 动画之前执行（同步 import 即可） */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
